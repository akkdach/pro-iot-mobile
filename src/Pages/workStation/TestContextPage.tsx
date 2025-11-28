import { useWork } from "../../Context/WorkStationContext";
import { Button, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TestContextPage = () => {
    const navigate = useNavigate();

  const {
    addPart,
    deletePart,
    setScannedCode,
    submitWork,
    startWork,
    finishWork,
    work,
    setWork,
  } = useWork();

  useEffect(() => {
    console.log("work เปลี่ยนแล้ว : ", work);
  }, [work]);

  const handleClick = () => {
    addPart("Some part", 6);
    deletePart("KT", 9);
    setScannedCode("codecodecode");
    submitWork();
    startWork();
    finishWork();
    console.log(work?.itemDes);
  };

  const handleSetWork = () => {
    console.log("set work");

    const newWork = {
      id: 200,
      lastName: "Doe",
      firstName: "John",
      age: 28,

      workOrder: "W123",
      orderType: "ZC99",
      description: "งานทดสอบ",
      equipment: "Test Machine",
      status: "PENDING",
      currentStation: "Station A",
      startDate: new Date("2025-05-01"),
      startTime: "10:00",
      finishDate: new Date("2025-05-01"),
      state: "high",

      item: "3",
      itemNo: "M99999",
      itemDes: "อะไหล่ทดสอบ",
      qtv: "5",
      qtvShip: "0",
    };

    setWork(newWork);

    console.log("newWork ที่เพิ่ง set:", work);
    navigate("/WorkStation")
  };

  return (
    <div>
      <h1>TestContextPage</h1>
      <div
        style={{
          display: "flex",
          gap: 4,
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <Button variant="contained" sx={{ fontSize: 20 }} onClick={handleClick}>
          Test
        </Button>

        <Button
          variant="contained"
          sx={{ fontSize: 20 }}
          onClick={handleSetWork}
        >
          set Work
        </Button>
      </div>
    </div>
  );
};
export default TestContextPage;
