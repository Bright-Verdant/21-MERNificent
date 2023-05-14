import React, { useState, useEffect } from "react";
import {
  
  Container,
  Col,
  Form,
  Button,
  Card,
  
} from "react-bootstrap";

import Auth from "../utils/auth";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";


import { SAVE_BOOK } from "../utils/mutations";
import { useMutation } from "@apollo/react-hooks";

const SearchBooks = () => {

  const [searchedBooks, setSearchedBooks] = useState([]);
  
  const [searchInput, setSearchInput] = useState("");
 
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });


  const [saveBook] = useMutation(SAVE_BOOK);

 
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchInput}`
      );

      if (!response.ok) {
        throw new Error("something went wrong!");
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ["No author to display"],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      }));

      setSearchedBooks(bookData);
      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };

 
  const handleSaveBook = async (bookId) => {
    
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const response = await saveBook({
        variables: {
          input: bookToSave,
        },
      });

      if (!response) {
        throw new Error("something went wrong!");
      }

    
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="Jumbotron">
        <Container>
          <h1>Search for Books!</h1>
          <div onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="searchInput">Search for a book</label>
              <input
                className="form-control"
                name="searchInput"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                type="text"
                placeholder="Search for a book"
              />
            </div>
            <button type="submit" className="btn btn-success">
              Submit Search
            </button>
          </div>
          
        </Container>
      </div>

      


{/* <div onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="searchInput">Search for a book</label>
              <input
                className="form-control"
                name="searchInput"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                type="text"
                placeholder="Search for a book"
              />
            </div>
            <button type="submit" className="btn btn-success">
              Submit Search
            </button>
          </div> */}


      <Container>
        <h2>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : "Search for a book to begin"}
        </h2>
        <div className="Card-Columns">
          {searchedBooks.map((book) => {
            return (
              <Card key={book.bookId} border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )
                        ? "This book has already been saved!"
                        : "Save this Book!"}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </Container>
    </>
  );
};

export default SearchBooks;
