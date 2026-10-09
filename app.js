require("dotenv").config();
const express = require("express");
const session = require("express-session");
const pool = require("./db");

const app = express();
const PORT = 3000;

// Tell Express to use EJS
app.set("view engine", "ejs");

// Allow Express to read information submitted from forms
app.use(express.urlencoded({ extended: true }));

// Allow Express to use files from the public folder
app.use(express.static("public"));
// Remember the signed-in user
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Make the signed-in user available to EJS pages
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Require sign-in for protected actions
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/signin");
  }
  next();
}
// SIGN-UP PAGE
app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

// CREATE AN ACCOUNT
app.post("/signup", async (req, res, next) => {
  const user_id = String(req.body.user_id || "").trim();
  const name = String(req.body.name || "").trim();
  const password = String(req.body.password || "");

  if (
    !user_id ||
    !name ||
    !password ||
    user_id.length > 255 ||
    name.length > 255 ||
    password.length > 255
  ) {
    return res.status(400).render("signup", {
      error: "Complete all fields using no more than 255 characters each.",
    });
  }

  try {
    const existing = await pool.query(
      "SELECT user_id FROM public.users WHERE user_id = $1",
      [user_id],
    );

    if (existing.rows.length > 0) {
      return res.status(409).render("signup", {
        error: "That user ID is already taken. Choose another.",
      });
    }

    await pool.query(
      "INSERT INTO public.users (user_id, password, name) VALUES ($1, $2, $3)",
      [user_id, password, name],
    );

    res.redirect("/signin");
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).render("signup", {
        error: "That user ID is already taken. Choose another.",
      });
    }
    next(error);
  }
});

// SIGN-IN PAGE
app.get("/signin", (req, res) => {
  res.render("signin", { error: null });
});

// SIGN IN
app.post("/signin", async (req, res, next) => {
  const user_id = String(req.body.user_id || "").trim();
  const password = String(req.body.password || "");

  try {
    const result = await pool.query(
      "SELECT user_id, name FROM public.users WHERE user_id = $1 AND password = $2",
      [user_id, password],
    );

    if (result.rows.length === 0) {
      return res.status(401).render("signin", {
        error: "Incorrect user ID or password. Please try again.",
      });
    }

    // Start a fresh session after successful sign-in
    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.user = result.rows[0];

      req.session.save((error) => {
        if (error) return next(error);
        res.redirect("/");
      });
    });
  } catch (error) {
    next(error);
  }
});

// SIGN OUT
app.post("/signout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("connect.sid");
    res.redirect("/signin");
  });
});

// HOME PAGE: load posts from PostgreSQL
app.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        blog_id AS id,
        creator_name AS author,
        creator_user_id,
        title,
        body AS content,
        category,
        date_created AS "createdAt"
      FROM public.blogs
      ORDER BY date_created DESC, blog_id DESC
    `);

    res.render("index", {
      posts: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// CREATE A NEW POST
// CREATE A NEW POST
app.post("/posts", requireLogin, async (req, res, next) => {
  const title = String(req.body.title || "").trim();
  const content = String(req.body.content || "").trim();
  const category = String(req.body.category || "");
  const allowedCategories = ["Tech", "Lifestyle", "Education"];

  if (
    !title ||
    title.length > 255 ||
    !content ||
    !allowedCategories.includes(category)
  ) {
    return res
      .status(400)
      .send(
        "Enter a title of 1–255 characters, content, and a valid category.",
      );
  }

  try {
    await pool.query(
      `INSERT INTO public.blogs
       (creator_name, creator_user_id, title, body, category)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.session.user.name,
        req.session.user.user_id,
        title,
        content,
        category,
      ],
    );

    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

// EDIT PAGE
// EDIT PAGE: load a post owned by the signed-in user
app.get("/posts/:id/edit", requireLogin, async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    return res.status(400).send("Invalid post ID");
  }

  try {
    const result = await pool.query(
      `SELECT
         blog_id AS id,
         creator_name AS author,
         title,
         body AS content,
         category
       FROM public.blogs
       WHERE blog_id = $1 AND creator_user_id = $2`,
      [id, req.session.user.user_id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send("Post not found or you do not have permission to edit it.");
    }

    res.render("edit", {
      post: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE POST
// UPDATE POST: only the creator can save changes
app.post("/posts/:id/edit", requireLogin, async (req, res, next) => {
  const id = Number(req.params.id);
  const title = String(req.body.title || "").trim();
  const content = String(req.body.content || "").trim();
  const category = String(req.body.category || "");
  const allowedCategories = ["Tech", "Lifestyle", "Education"];

  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    return res.status(400).send("Invalid post ID");
  }

  if (
    !title ||
    title.length > 255 ||
    !content ||
    !allowedCategories.includes(category)
  ) {
    return res
      .status(400)
      .send(
        "Enter a title of 1–255 characters, content, and a valid category.",
      );
  }

  try {
    const result = await pool.query(
      `UPDATE public.blogs
       SET title = $1, body = $2, category = $3
       WHERE blog_id = $4 AND creator_user_id = $5
       RETURNING blog_id`,
      [title, content, category, id, req.session.user.user_id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send("Post not found or you do not have permission to edit it.");
    }

    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

// DELETE POST: only the creator can delete it
app.post("/posts/:id/delete", requireLogin, async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    return res.status(400).send("Invalid post ID");
  }

  try {
    const result = await pool.query(
      `DELETE FROM public.blogs
       WHERE blog_id = $1 AND creator_user_id = $2
       RETURNING blog_id`,
      [id, req.session.user.user_id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send("Post not found or you do not have permission to delete it.");
    }

    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

// START THE SERVER
app.listen(PORT, () => {
  console.log(`Blog application running at http://localhost:${PORT}`);
});
