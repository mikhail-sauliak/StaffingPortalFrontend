import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Tab, { tabClasses } from "@mui/material/Tab";
import Tabs, { tabsClasses } from "@mui/material/Tabs";

interface TabsTwitterProps {
  value: number; // or string, depending on your value
  onChange: (event: React.SyntheticEvent, newValue: number) => void; // Adjust the type based on your actual usage
}

const TabItem = styled(Tab)(({ theme }) => ({
  minHeight: 53,
  minWidth: 80,
  textTransform: "none",
  fontSize: 15,
  fontWeight: 700,
  color: "#657786",
  opacity: 1,
  "&:hover": {
    backgroundColor: "rgba(29, 161, 242, 0.1)",
    color: "#1da1f2",
  },
  [theme.breakpoints.up("md")]: {
    minWidth: 120,
  },
  [`&.${tabClasses.selected}`]: {
    color: "#1da1f2",
  },
}));

export function TabsTwitter({ value, onChange }: TabsTwitterProps) {

  return (
    <Tabs
      textColor="inherit"
      value={value}
      onChange={onChange}
      sx={{
        width: "100%",
        boxShadow: "inset 0 -1px 0 0 #E6ECF0",
        [`& .${tabsClasses.indicator}`]: {
          backgroundColor: "#1da1f2",
        },
      }}
    >
      <TabItem disableRipple label={"Create Manager"} />
      <TabItem disableRipple label={"People"} />
      <TabItem disableRipple label={"Salary Reviews"} />
      <TabItem disableRipple label={"Statistics"} />
      <TabItem disableRipple label={"Salary Planning"} />
      <TabItem disableRipple label={"Employee Data"} />
      <TabItem disableRipple label={"Salary Ranges"} />
      <TabItem disableRipple label={"Upload Data"} />
      <TabItem disableRipple label={"Upload Playground"} />
    </Tabs>
  );
}

TabsTwitter.propTypes = {
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
};