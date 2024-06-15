```markdown
# Bitespeed Identity Reconciliation Service

## Overview

This service implements an endpoint `https://bitespeed-project-3.onrender.com/contact/identify` to reconcile and consolidate
customer contacts based on email and phone number information. It manages contacts in a relational database,
distinguishing between primary and secondary contacts.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/bcoder4702/BiteSpeed_Project.git
   ```

2. **Install dependencies:**

   ```bash
   cd BiteSpeed_Project
   npm install
   ```

3. **Set up environment variables:**

   - Create a `.env` file based on `.env` and configure database connection details.

4. **Run the application:**

   ```bash
   npm start
   ```

## Endpoint `contact/identify`

### Request Format

```json
POST /contact/identify
Content-Type: application/json

{
  "email": "string",
  "phoneNumber": "string"
}
```

### Response Format

```json
{
  "contact": {
    "primaryContactId": number,
    "emails": [string],
    "phoneNumbers": [string],
    "secondaryContactIds": [number]
  }
}
```

## Technologies Used

- Node.js
- Express.js
- SQL (for DB operations)
- Used Clever Cloud for Deploying Mysql DB 
- Hosting on Render.com

## Contact

For any questions or feedback, please contact:

- Email: bverma4702@gmail.com
- GitHub: [Bitthal Verma](https://github.com/bcoder4702)
```
