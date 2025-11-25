
import React from "react";
import { Card, CardContent, Typography, Avatar, Box } from "@mui/material";

interface UserCardProps {
  name: string;
  avatarUrl: string;
  workcenter: string;
}

const UserCard: React.FC<UserCardProps> = ({ name, avatarUrl, workcenter }) => {
  return (
    <Card
      sx={{
        maxWidth: 360,
        margin: "auto",
        borderRadius: 3,
        boxShadow: 3,
        padding: 2,
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          src={avatarUrl}
          alt={name}
          sx={{ width: 64, height: 64 }}
        />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {workcenter}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default UserCard;
