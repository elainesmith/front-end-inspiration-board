import React, { useEffect, useState } from "react";
import "./Board.css";
import PropTypes from "prop-types";
import axios from "axios";
import NewCardForm from "./NewCardForm";
import CardList from "./CardList";

const Board = ({ board_id, changeBoardCallback }) => {
  useEffect(() => {
    getBoardData(board_id);
  }, []);

  const [owner, setOwner] = useState("Default Owner");
  const [title, setTitle] = useState("Default Title");

  const getBoardData = (board_id) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/boards/${board_id}`)
      .then((response) => {
        setTitle(response.data.title);
        setOwner(response.data.owner);
      })
      .catch((error) => console.log("Didnt get board data", error));
  };

  const deleteBoard = (board_id) => {
    axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/boards/${board_id}`)
      .then(() => {
        console.log("deleted board");
        changeBoardCallback(0);
      })
      .catch((error) => console.log(`Cannot delete board ${error}`));
    console.log("Board deleted now we are resetting display");
    changeBoardCallback(0);
  };

  const [cardsDisplayedOnBoard, setCardsDisplayedOnBoard] = useState([]);

  useEffect(() => {
    getCardData(board_id);
  }, []);

  const getCardData = () => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/boards/${board_id}/cards`)
      .then((response) => {
        setCardsDisplayedOnBoard(response.data.cards);
      })
      .catch((error) => {
        console.log(
          `Cards for this Board Cannot be Displayed Delete Due to: ${error}`
        );
      });
  };

  const makeNewCard = (newCard) => {
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/boards/${board_id}/cards`, {
        message: newCard,
      })
      .then((response) => {
        getCardData();
      })
      .catch((error) => {
        console.log(
          `Cards for this Board Cannot be Displayed Delete Due to: ${error}`
        );
      });
  };

  const deleteCard = (card_id) => {
    axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/cards/${card_id}`)
      .then((response) => {
        const updatedCards = cardsDisplayedOnBoard.filter(
          (card) => card.id !== card_id
        );
        setCardsDisplayedOnBoard(updatedCards);
      })
      .catch((error) => {
        console.log(`Card Cannot be Deleted Due to: ${error}`);
      });
  };

  const likeCard = (card_id) => {
    const likedCards = [...cardsDisplayedOnBoard];
    let targetCard;
    for (let card of likedCards) {
      if (card.id === card_id) {
        targetCard = card;
      }
    }

    axios
      .patch(
        `${process.env.REACT_APP_BACKEND_URL}/cards/${targetCard.id}/like`,
        { likes_count: targetCard.likes_count + 1 }
      )
      .then((response) => {
        targetCard.likes_count += 1;
        setCardsDisplayedOnBoard(likedCards);
      })
      .catch((error) => {
        console.log(`New Card Could Not be Created Due to: ${error}`);
      });
  };

  return (
    <>
      <div className="Board">
        <button className="btn back" onClick={() => changeBoardCallback(0)}>
          🔙 TO MENU
        </button>

        <h1>{title}</h1>
        <h2>{owner}</h2>

        <CardList
          cardsDisplayedOnBoard={cardsDisplayedOnBoard}
          deleteCardCallback={deleteCard}
          likeCardCallback={likeCard}
        />
        <button className="btn delete" onClick={() => deleteBoard(board_id)}>
          *DELETE THIS BOARD*
        </button>
      </div>
      <div>
        <NewCardForm handleSubmission={makeNewCard} />
      </div>
    </>
  );
};
export default Board;

Board.propTypes = {
  board_id: PropTypes.number.isRequired,
  changeBoardCallback: PropTypes.func.isRequired,
};
