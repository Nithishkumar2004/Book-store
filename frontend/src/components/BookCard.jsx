import React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink from react-router-dom

const BookCard = ({ book }) => {
  // Destructuring the properties from the book object
  const {
    bookImage,
    bookName,
    authorName,
    genre,
    publicationYear,
    description,
    price,
    rating,
    pages,
    isbn,
    language,
    _id, // Assuming _id is the unique identifier for the book
  } = book;

  return (
    <div className="max-w-sm bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Displaying the book image */}
      <img
        src={bookImage} // Using the bookImage URL from the destructured data
        alt={bookName} // Using bookName as alt text
        className="w-full h-56 object-cover"
      />
      <div className="p-6">
        {/* Book title */}
        <h3 className="text-2xl font-semibold text-gray-800">{bookName}</h3>
        
        {/* Author */}
        <p className="text-md text-gray-600">By {authorName}</p>

        {/* Genre */}
        <p className="text-sm text-gray-500 mt-2">Genre: {genre}</p>

        {/* Publication year */}
        <p className="text-sm text-gray-500 mt-2">Published: {publicationYear}</p>

        {/* Description */}
        <p className="text-sm text-gray-500 mt-2">Pages: {pages}</p>
        <p className="text-sm text-gray-500 mt-2">ISBN: {isbn}</p>
        <p className="text-sm text-gray-500 mt-2">Language: {language}</p>

        {/* Book Description */}
        <p className="text-gray-700 mt-4">{description}</p>

        {/* Price and Rating */}
        <div className="flex justify-between mt-4">
          <span className="text-lg font-bold text-gray-800">₹{price}</span>
          <span className="text-lg font-semibold text-yellow-500">{'⭐'.repeat(rating)}</span>
        </div>

        {/* NavLink for purchase */}
        <div className="mt-4">
          <NavLink
            to={`/purchase/${_id}`} // Link to the purchase page with the book's ID
            className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-md"
          >
            Purchase Book
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
