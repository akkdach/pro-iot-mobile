import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import DoneIcon from "@mui/icons-material/Done";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import PercentIcon from "@mui/icons-material/Percent";
import callApi from "../../Services/callApi";
import Swal from "sweetalert2";
import { formatMinutesToHours } from "../../Utility/DatetimeService";
import AppHearder from "../../Component/AppHeader";
import UserCard from "../../Component/UserCard";
import { useUser } from "../../Context/userContext";
import AnimatedProgressBar from "../../Component/AnimatedProgressBar";
import ChartsRatioPie from "../../Component/Charts/ChartsRatioPie";

const StandardTimeDashboard: React.FC = () => {
  const { user } = useUser();
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [completedJobs, setCompletedJobs] = useState<number>(0);
  const [totalStandardTime, setTotalStandardTime] = useState<number>(0);
  const [totalActualTime, setTotalActualTime] = useState<number>(0);
  const [difference, setDifference] = useState<number>(0);
  const [percent, setPercent] = useState<number>(0);
  const [onTime, setOnTime] = useState<number>(0);
  const [overTime, setOverTime] = useState<number>(0);

  const items = {
    totalJob: { label: "Total Jobs", value: totalJobs, icon: <WorkIcon />, color: "#A5D6A7" },
    complateJob: { label: "Completed Jobs", value: completedJobs, icon: <DoneIcon />, color: "#81D4FA" },
    standardTime: { label: "Standard Time", value: `${formatMinutesToHours(totalStandardTime)} hrs`, icon: <AccessTimeIcon />, color: "#CE93D8" },
    actualTime: { label: "Actual Time", value: `${formatMinutesToHours(totalActualTime)} hrs`, icon: <AccessTimeIcon />, color: "#FFCC80" },
    difference: { label: "Difference", value: `${formatMinutesToHours(difference)} hrs`, icon: <CompareArrowsIcon />, color: "#F48FB1" },
    percent: { label: "Percent", value: percent.toLocaleString(), icon: <PercentIcon />, color: "#B39DDB" },
  };

  useEffect(() => {
    onload();
  }, []);
  const onload = async () => {
    var result = await callApi.post('/Dashboard1/StandardTimeDashboard', {});
    if (result.data?.isSuccess) {
      // console.log(result.data.dataResult);
      setTotalJobs(result.data.dataResult?.totalJob)
      setCompletedJobs(result.data.dataResult?.complateJob)
      setTotalStandardTime(result.data.dataResult?.totalDurationNormal)
      setTotalActualTime(result.data.dataResult?.totalActualMinutes)
      setDifference(result.data.dataResult?.difference)
      setPercent(result.data.dataResult?.percenDiffernce)
      setOnTime(result.data.dataResult?.onTime)
      setOverTime(result.data.dataResult?.overTime)
    } else {
      Swal.fire('เกิดข้อผิดพลาด', result.data?.message, 'error');
    }
  }

  return (
    <>
      <AppHearder title="Standard Time Summary" />

      <Card
        sx={{
          maxWidth: 400,
          p: 2,
          boxShadow: 3,
          borderRadius: 3,
          backgroundColor: "#F9F9F9",
          marginTop: 5,
        }}
      >
        <CardContent>

          <UserCard name={user?.fullname ?? ''} avatarUrl={user?.image_url ?? ''} workcenter={`${user?.role ?? ''} ${user?.wk_ctr ?? ''}`} />
          <Box display="" flexDirection="column" gap={2} mt={2} >
            <ChartsRatioPie onTime={onTime} overTime={overTime} title="Work Ratio"/>
          </Box>
          <Box display="" flexDirection="column" gap={2} mt={2} >
            <AnimatedProgressBar targetValue={totalJobs} actualValue={completedJobs} targetLabel={'Total Job'} actualLabel={'Total Complete'}  />
          </Box>
          <Box display="" flexDirection="column" gap={2} mt={2} >
            <AnimatedProgressBar targetValue={totalStandardTime} actualValue={totalActualTime} targetLabel={'Standard Time'} actualLabel={'Actual Time'}  />
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default StandardTimeDashboard;