const { prisma } = require("./common");
const bcrypt = require("bcrypt");

//Create a user and hash the password
const createUser = async (firstName, lastName, email, password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const response = await prisma.users.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};

//Get a User by email
const getUser = async (email) => {
  const response = await prisma.users.findFirstOrThrow({
    where: {
      email,
    },
  });
  return response;
};

//Get a User Id with related data
const getUserId = async (id) => {
  const response = await prisma.users.findFirstOrThrow({
    where: {
      id,
    },
    include: {
      reviews: true,
      comments: true,
      recipes: true,
      favorites: {
        include: {
          recipe: {
            select: {
              name: true,
              photo: true,
              description: true,
            },
          },
        },
      },
    },
  });
  return response;
};


module.exports = { createUser, getUser, getUserId };
