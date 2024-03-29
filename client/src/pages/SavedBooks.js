import React from "react";
import {
  
  Container,
  
  Card,
  Button,
} from "react-bootstrap";
import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";
import { useQuery, useMutation } from "@apollo/react-hooks";

const SavedBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  let userData = data?.me || {};
  console.log(userData);
  const [removeBook] = useMutation(REMOVE_BOOK);

  
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { user } = await removeBook({
        variables: {
          bookId: bookId,
        },
      });

      userData = user;
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className="Jumbotron">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <div className="Card-Columns">
          {userData.savedBooks?.map((book) => {
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
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </Container>
    </>
  );
};

export default SavedBooks;
