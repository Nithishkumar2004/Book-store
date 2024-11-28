# BookEase

BookEase is an application that allows users to explore a vast collection of books, make purchases, and manage their profiles with ease. This README provides an overview of the app's features and user flow.

## Naan Mudhalvan: BookEase

This project is developed as part of the Naan Mudhalvan Program. The course is MERN Stack Powered by MongoDB (subject code: NM1042), conducted for Tagore Engineering College (College Code: 4127). The platform is built using the MERN (MongoDB, Express, React, Node.js) stack.

**Status**: Completed...

## Team Members

| Name | NM ID | Email Address | AU ID |
|------|-------|---------------|--------|
| **NITHISHKUMAR S** | 8C666C4851E544BBB904951222B8320B | nithishcse2021@gmail.com | AU412721104032 |
| **ROSHINI D** | 97D6993D962881C97784A001B70E1E40 | roshinisparkle16@gmail.com | AU412721104040 |
| **KIRUTHIKA E** | 496FA98E0E738E8A53D4D2620194B834 | elumalaitce9500@gmail.com | AU412721104023 |
| **SAGAYA RAJ D** | BF3C1F95193518ABAF141AECB3F8F0FF | rajsagaya875@gmail.com | AU412721104041 |
| **SUMATHI V** | 8057B8A54C2A735ADA4430F29D16DB96 | vsumathi0711@gmail.com | AU412721104051 |

## Table of Contents

- [Features](#features)
- [User Flow](#user-flow)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)

## Features

- **Vast Collection of Books**: Explore a wide variety of books across different genres
- **User Profiles**: Users can create and manage their profiles, including personal information and order history
- **Book Selection**: Browse available books with details such as title, author, genre, and price
- **Book Purchase**: Easily purchase books by selecting quantities and options like e-book formats or special editions
- **Order Management**: View current and past orders, including order status and payment history
- **Order Confirmation**: Receive confirmation for new purchases after selecting books and quantities

## User Flow

1. **Start**: Users open the BookEase app to explore a vast collection of books
2. **Home Page**: Users land on the home page, which provides an overview of the book store's offerings
3. **Access Profile**: Users can access their profiles to view or update personal information, preferences, and order history
4. **Book Selection**: Users browse and select books to purchase from the available collection
5. **Book Purchase**: Users navigate through options, specify quantities, and choose additional formats
6. **View Orders**: Users can view their current and past orders with complete details
7. **Order Confirmation**: Users receive confirmation after completing their purchase
8. **End**: The flow concludes as users complete their desired actions

## Technologies Used

- **MongoDB**: NoSQL database to store user data and book information
- **Express.js**: Web framework for building the backend API
- **React.js**: Frontend library for building user interfaces
- **Node.js**: JavaScript runtime for building the backend of the application

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4 or higher)

### Environment Variables
Create a `.env` file in the backend directory with:
```bashPORT=3000
mongoDBURL='mongodb+srv://nithishcse2021:qAcv0YyZNkP18MgO@cluster0.z7clm.mongodb.net/Bookstore?retryWrites=true&w=majority&appName=Cluster0'
REACT_APP_ENDPOINT='http://localhost:3000'
JWT_SECRET='b6188365be95d62f6dc082f1844e4f3eb862bc8f41438bf5c2c13d2aaa7776e0b251af76795211f34779860d5d5a2c3288590e0921695d51510c13c814a37830fded89ecbc9941f3c16e41e90fd889f1e009a8d31352325947eb8cf43db7905626027664b586b9dc3586a0873645232770821185a2833cdd350a31701c5944764734e4b6cf1daf4b05286664c8f44c45c90c0d24db43292229b3d20807d43c3dacc7d608877ede662d15f16b9406b3e5eb22a3a5574df6a39900a9df4141831b0a3ad42ee9431db12c0236777d9c37ca4c0f732446ca898496ca94360eadc8d065dd5fb7792111ed7c20137c7112698c11928d253819989fa4e77750156b8ff7'
JWT_EXPIRY=3600000  # Optional: Set the expiry time for JWT
CLOUDINARY_CLOUD_NAME='dvbgs8fy1'
CLOUDINARY_API_KEY='148237359281976'
CLOUDINARY_API_SECRET='HN_KnZyL-oaKeyBSlF3BVoEWbOU'
```

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Nithishkumar2004/Book-store.git
   ```

2. Install dependencies for both frontend and backend:

   For backend:
   ```bash
   cd backend
   npm install
   ```

   For frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Set up your environment variables for the backend (e.g., MongoDB connection URL)

4. Start the servers:

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Usage

Once the application is running:

1. Open your browser and navigate to `http://localhost:5173`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes and commit them (`git commit -m 'Add new feature'`)
4. Push to your fork (`git push origin feature-branch`)
5. Open a pull request with a description of your changes
