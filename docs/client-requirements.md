# Client Requirements: Lqito (University Lost & Found)

## 1. The problem

Today, students at our university post lost and found items in Facebook groups. These posts get buried in a few hours, and there is no search or category to help find them. Nobody checks who is really the owner of an item, so an item can be given to the wrong person. Students also publish their phone numbers publicly to be contacted. Finally, the university has no record of what was lost, found or returned.

We need one platform where only verified students can post, every post is checked by an admin, and every item is handed back to its real owner at the Lost & Found office.

## 2. The 3 roles

### Visitor (anyone, no account)
- Can: see published posts, search, filter, open a post.
- Cannot: create posts, send claims, see who wrote a post, see any student's personal data.

### Student (approved account)
- Can: everything a visitor can, plus create posts, send claims, see "My posts" and "My claims", and close their own post.
- Cannot: see other students' full name, student ID or email; see pending or rejected posts of others; open the admin pages.

### Admin (university staff)
- Can: approve or reject accounts, posts and claims; ban users; read the admin log.
- Cannot: approve their own post or claim (no conflict of interest).

### Account states (a student account is not always active)
- **Pending:** signed up but not approved yet. Can log in and only sees "Your account is waiting for approval".
- **Banned:** blocked by an admin. Can log in and only sees "Your account is blocked".

## 3. User stories

| ID | Feature | User story |
|----|---------|------------|
| F1 | Sign up, log in, log out | As a visitor, I want to sign up with my email, password, full name and student ID, and log in and out, so that the university knows I am a real student. |
| F2 | Account approval and ban | As an admin, I want to approve, reject or ban an account after checking the student ID, so that only real students can post and claim. |
| F3 | Create a post | As a student, I want to create a post with a type (lost or found), category, title, description, location and date, so that other people can help me find my item or its owner. |
| F4 | Post review | As an admin, I want to review every post and publish it or reject it with a reason, so that the site has no spam and no fake posts. |
| F5 | Home page, search and filters | As a visitor, I want to see the newest published posts and search or filter them by type and category, so that I can find an item in less than 30 seconds on my phone. |
| F6 | Post details | As a visitor, I want to open a post and read its full details, so that I can check if it matches the item I lost or found. |
| F7 | Claims | As a student, I want to send a claim ("This is mine" or "I found it") with a message that only the real owner or finder would know, so that I can prove my claim. |
| F8 | Claim decision | As an admin, I want to accept or reject a claim, and when I accept it the post becomes resolved with hand-over instructions, so that the item goes back to its real owner. |
| F9 | My page | As a student, I want to see my posts and my claims with their status, and close my own post, so that I know what is happening and can stop a post when I find my item myself. |
| F10 | Admin dashboard | As an admin, I want one dashboard with tabs Accounts, Posts, Claims and Log, with the number of pending items, so that I can handle everything quickly and keep a record of my decisions. |
| F11 | Health check | As the DevOps team, we want a health check at /api/health, so that Docker and Render can know that the site is running. |