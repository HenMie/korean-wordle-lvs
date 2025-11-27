import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
// import taeguk from "@assets/flags/taeguk.svg";
import ko_flag from "@assets/flags/ko-flag.svg";
import uk_flag from "@assets/flags/uk-flag.svg";
import gr_flag from "@assets/flags/gr-flag.svg";
import de_flag from "@assets/flags/de-flag.svg";
import cn_flag from "@assets/flags/cn-flag.svg";
import { useLanguage } from "@contexts/LanguageContext";

export default function AccountMenu() {
  const { changeLanguage } = useLanguage();

  const [langIcon, setLangIcon] = useState(cn_flag);
  const [langIconState, setLangIconState] = useState(false);

  useEffect(() => {
    const selectedLang = localStorage.getItem("language") || "zh";
    switch (selectedLang) {
      case "zh":
        setLangIcon(cn_flag);
        break;
      case "ko":
        setLangIcon(ko_flag);
        break;
      case "en":
        setLangIcon(uk_flag);
        break;
      case "de":
        setLangIcon(de_flag);
        break;
      case "el":
        setLangIcon(gr_flag);
        break;
      default:
        setLangIcon(cn_flag);
    }
  }, [langIconState]);

  const handleSelectLangs = (lang) => {
    localStorage.setItem("language", lang);
    changeLanguage(lang);
    setLangIconState(!langIconState);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Language">
          <IconButton onClick={handleClick} size="medium">
            <Avatar src={langIcon} sx={{ width: 21, height: 21 }} alt="flag" />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="langs-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => handleSelectLangs("zh")}>
          <Avatar src={cn_flag} sx={{ width: 25, height: 25 }} /> 简体中文
        </MenuItem>
        <MenuItem onClick={() => handleSelectLangs("ko")}>
          <Avatar src={ko_flag} sx={{ width: 25, height: 25 }} /> 한국어
        </MenuItem>
        <MenuItem onClick={() => handleSelectLangs("en")}>
          <Avatar src={uk_flag} sx={{ width: 25, height: 25 }} /> English
        </MenuItem>
        <MenuItem onClick={() => handleSelectLangs("de")}>
          <Avatar src={de_flag} sx={{ width: 25, height: 25 }} /> Deutsch
        </MenuItem>
        <MenuItem onClick={() => handleSelectLangs("el")}>
          <Avatar src={gr_flag} sx={{ width: 25, height: 25 }} /> Ελληνικά
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
