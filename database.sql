-- CS-312 Mini Project 3
-- Create a database named BlogDB in pgAdmin first.
-- Open its Query Tool and run this file once.
-- Demo passwords match the application's current plain-text login.

BEGIN;

CREATE TABLE public.users (
    user_id VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE public.blogs (
    blog_id SERIAL PRIMARY KEY,
    creator_name VARCHAR(255) NOT NULL,
    creator_user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(255) NOT NULL DEFAULT 'Education',
    CONSTRAINT blogs_creator_user_id_fkey
        FOREIGN KEY (creator_user_id)
        REFERENCES public.users(user_id)
);

-- Three demo accounts
INSERT INTO public.users (user_id, password, name)
VALUES
    ('dhruti', 'DemoDhruti123!', 'Dhruti Patel'),
    ('alex', 'DemoAlex123!', 'Alex Morgan'),
    ('maya', 'DemoMaya123!', 'Maya Shah');

-- Five initial blog posts
INSERT INTO public.blogs (
    creator_name,
    creator_user_id,
    title,
    body,
    date_created,
    category
)
VALUES
(
    'Dhruti Patel',
    'dhruti',
    'My First Blog Post',
    'Welcome to my blog! I am studying cybersecurity at NAU, and I created this space to share what I learn about technology, coding, and college life.',
    '2026-10-07 10:00:00',
    'Education'
),
(
    'Alex Morgan',
    'alex',
    'Learning to Build Websites',
    'Building a website has helped me understand how HTML, CSS, and JavaScript work together. I enjoy testing new layouts and making pages easier to use on both phones and computers.',
    '2026-10-07 11:00:00',
    'Tech'
),
(
    'Maya Shah',
    'maya',
    'Staying Organized in College',
    'Keeping a weekly schedule helps me balance classes, assignments, and time with friends. I break larger projects into small tasks so I can make steady progress without feeling overwhelmed.',
    '2026-10-07 12:00:00',
    'Lifestyle'
),
(
    'Dhruti Patel',
    'dhruti',
    'What I Enjoy About Cybersecurity',
    'I enjoy learning how to protect computers, networks, and personal information. My cybersecurity classes give me opportunities to practice troubleshooting and understand how small security decisions can make a big difference.',
    '2026-10-07 13:00:00',
    'Tech'
),
(
    'Alex Morgan',
    'alex',
    'Learning from Coding Mistakes',
    'When my code does not work, I start by reading the error message and checking one part at a time. Fixing mistakes helps me understand my programs better and become more confident as a developer.',
    '2026-10-07 14:00:00',
    'Tech'
);

COMMIT;