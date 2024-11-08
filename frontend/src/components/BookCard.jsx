import React from 'react';

const BookCard = ({ book }) => {
  const { title, coverImage } = book;

  // Convert coverImage to a base64 string
  const base64String = coverImage
    ? `data:image/jpeg;base64,${btoa(
        String.fromCharCode(...new Uint8Array(coverImage.data))
      )}`
    : null;

  return (
    <div>
      <h3>{title}</h3>
      {base64String ? (
        <img src={base64String} alt={title} />
      ) : (
        <p>No cover image available</p>
      )}
    </div>
  );
};

export default BookCard;
