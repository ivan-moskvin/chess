import { store } from "../../../app/store";
import { initSquares } from "../../board/boardSlice";
import { initPieces } from "../../board/thunks";
import { selectHistory } from "../historySlice";
import { back, initHistory } from "../thunks";
import { movePieceFromTo } from "../../piece/thunks";
import { getHistoryItemName } from "../utils";

describe("History", function () {
  const { dispatch, getState } = store

  beforeEach(() => {
    dispatch(initSquares())
    dispatch(initPieces())
    dispatch(initHistory())
  })

  describe("snapshots", () => {
    it("have 0 snaphots initially", () => {
      expect(selectHistory(getState())).toHaveLength(0)
    })

    it("pushes snapshots", () => {
      dispatch(movePieceFromTo("E2", "E4"))

      expect(selectHistory(getState())).toHaveLength(1)
    })
  })

  describe("traverse back", function () {
    it("traverses back", () => {
      dispatch(movePieceFromTo("E2", "E4"))
      dispatch(movePieceFromTo("E7", "E5"))
      dispatch(back())

      const history = selectHistory(getState())

      expect(history).toHaveLength(1)
      expect(history[0].name).toEqual(getHistoryItemName("E2", "E4"))
    })
  });
});