const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const JWT = process.env.JWT || "1234";
const { prisma } = require("../db/common");

// Import functions
const { createUser, getUser, getUserId } = require("../db/db");

const setToken = (id) => {
  return jwt.sign({ id }, JWT, { expiresIn: "5h" });
};

// Authorize the Token with Id
const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const token = authHeader.slice(7);
  if (!token) return next();
  try {
    const { id } = jwt.verify(token, JWT);
    const user = await getUserId(id);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Register a User
router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await prisma.users.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({
          message: "This email is already in use. Please use a different one.",
        });
    } else {
      const response = await createUser(firstName, lastName, email, password);
      const token = setToken(response.id);
      res.status(201).json({ token, user: response });
    }
  } catch (error) {
    next(error);
  }
});

// Login a User
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await getUser(email, password);
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = setToken(user.id);
      res.status(200).json({ token, role: user.role, user: user });
    } else {
      res.status(403).json({ message: "Username and Password do not match" });
    }
  } catch (error) {
    next(error);
  }
});

// Get the Logged-in User's Information
router.get("/me", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const response = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        recipes: {
          include: {
            review: true,
          },
        },
        favorites: {
          include: {
            recipe: { include: { review: true } },
          },
        },
        reviews: {
          include: {
            recipe: {
              include: {
                user: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: true,
            review: {
              include: {
                recipe: true,
                user: true,
              },
            },
          },
        },
      },
    });

    res.send(response);
  } catch (error) {
    next(error);
  }
});

// Get a Single User by Id
router.get("/user/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.users.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// Update Logged-In User
router.put("/user/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.users.update({
      where: {
        id: id,
      },
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
