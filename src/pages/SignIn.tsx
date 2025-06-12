import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ColorModeSelect from "../utils/ColorModeSelect";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";
import validates from "../utils/Validates";

// Styled components remain the same...
const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignIn() {
  const [signInInfo, setSignInInfo] = React.useState({
    email: "",
    password: "",
  });
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");
  const [isResetPassword, setIsResetPassword] = React.useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = React.useState("");
  const [resetPasswordError, setResetPasswordError] = React.useState("");
  const [isResetPasswordError, setIsResetPasswordError] = React.useState(true);

  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const decodeToken = (token: string) => {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setSubmitting(true);
    setLoginError("");

    //const data = new FormData(event.currentTarget);
    const email = signInInfo.email;
    const password = signInInfo.password;

    try {
      // Call the login API endpoint
      const response = await fetch(
        "https://alpha.be.atlas.galvanek-bau.de/gesys/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        const decoded = decodeToken(result.data.access_token);

        // Store tokens in localStorage
        localStorage.setItem("accessToken", result.data.access_token);
        localStorage.setItem("refreshToken", result.data.refresh_token);

        // Store the user's email for use in the vendor onboarding flow
        localStorage.setItem("user", JSON.stringify(decoded.user));

        // Notify auth context if needed
        if (login) {
          await login(email, password);
        }

        // Redirect to the onboarding page
        navigate("/");
      } else {
        // Handle login error
        setLoginError(
          result.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An error occurred during login. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (resetPasswordEmail === "") {
      setResetPasswordError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    setResetPasswordError("");

    const resetEmail = resetPasswordEmail;

    try {
      // Call the reset password API endpoint
      const response = await fetch(
        "https://alpha.be.atlas.galvanek-bau.de/gesys/users/reset-password?email=" +
          resetEmail,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setIsResetPasswordError(false);
        setIsResetPassword(true);
      } else {
        // Handle reset password error
        setResetPasswordError(
          result.message || "Reset password failed. Please check your email."
        );
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setResetPasswordError(
        "An error occurred during password reset. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !validates.validateEmail(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || !validates.validatePassword(password.value)) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      {isResetPassword ? (
        isResetPasswordError ? (
          <SignInContainer direction="column" justifyContent="space-between">
            <ColorModeSelect
              sx={{ position: "fixed", top: "1rem", right: "1rem" }}
            />
            <Card variant="outlined">
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  width: "100%",
                  fontSize: "clamp(2rem, 10vw, 2.15rem)",
                }}
              >
                Reset Password
              </Typography>
              {resetPasswordError && (
                <Box sx={{ color: "error.main", mt: 1, mb: 1 }}>
                  <Typography variant="body2">{resetPasswordError}</Typography>
                </Box>
              )}
              <Box
                component="form"
                onSubmit={handleResetPassword}
                noValidate
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  gap: 2,
                }}
              >
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <TextField
                    error={emailError}
                    helperText={emailErrorMessage}
                    value={resetPasswordEmail}
                    onChange={(e) => setResetPasswordEmail(e.target.value)}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={emailError ? "error" : "primary"}
                  />
                </FormControl>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={submitting}
                >
                  {submitting ? "Resetting password..." : "Reset password"}
                </Button>
              </Box>
            </Card>
          </SignInContainer>
        ) : (
          <SignInContainer direction="column" justifyContent="space-between">
            <ColorModeSelect
              sx={{ position: "fixed", top: "1rem", right: "1rem" }}
            />
            <Card variant="outlined">
              <Typography sx={{}}>
                Your password has been reset. Please check your email for
                further instructions.
              </Typography>
              <Link
                component="button"
                type="button"
                onClick={() => setIsResetPassword(false)}
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                Back to Sign In
              </Link>
            </Card>
          </SignInContainer>
        )
      ) : (
        <SignInContainer direction="column" justifyContent="space-between">
          <ColorModeSelect
            sx={{ position: "fixed", top: "1rem", right: "1rem" }}
          />
          <Card variant="outlined">
            <Typography
              component="h1"
              variant="h4"
              sx={{
                width: "100%",
                fontSize: "clamp(2rem, 10vw, 2.15rem)",
              }}
            >
              Sign in
            </Typography>
            {loginError && (
              <Box sx={{ color: "error.main", mt: 1, mb: 1 }}>
                <Typography variant="body2">{loginError}</Typography>
              </Box>
            )}
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 2,
              }}
            >
              <FormControl>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  error={emailError}
                  helperText={emailErrorMessage}
                  value={signInInfo.email}
                  onChange={(e) =>
                    setSignInInfo({ ...signInInfo, email: e.target.value })
                  }
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={emailError ? "error" : "primary"}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  value={signInInfo.password}
                  onChange={(e) =>
                    setSignInInfo({ ...signInInfo, password: e.target.value })
                  }
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  variant="outlined"
                  color={passwordError ? "error" : "primary"}
                />
              </FormControl>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={submitting}
              >
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
              <Link
                component="button"
                type="button"
                onClick={() => setIsResetPassword(true)}
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                Forgot your password?
              </Link>
            </Box>
          </Card>
        </SignInContainer>
      )}
    </>
  );
}
