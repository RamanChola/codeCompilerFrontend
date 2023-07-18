"use client";
import React from "react";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Container from "@mui/material/Container";
import { Toolbar } from "@mui/material";
const navItems = ["Login"];

// make changes here
export default function DrawerAppBar() {
  const pathname = usePathname();
  const { data, status } = useSession();
  let isHomePage =
    pathname == "/login" || pathname == "/register" ? false : true;

  return (
    <>
      <AppBar
        component="nav"
        elevation={0}
        position="static"
        style={{ zIndex: 999, backgroundColor: "black" }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h4"
              component="div"
              sx={{ flexGrow: 1, color: "White", fontWeight: 800 }}
            >
              <Link href="/" className="nav-link">
                Home
              </Link>
            </Typography>
            {isHomePage &&
              navItems.map((item, index) => (
                <Link
                  href={item.toLowerCase()}
                  key={index}
                  className="nav-link"
                >
                  {((!data && item === "Login") || item != "Login") && (
                    <Button color="inherit">{item}</Button>
                  )}
                </Link>
              ))}
            {data && (
              <>
                <Button
                  onClick={() => {
                    signOut();
                  }}
                  sx={{ fontWeight: 600, color: "red" }}
                >
                  Sign Out
                </Button>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
}
