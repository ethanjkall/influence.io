import bcrypt from "bcrypt";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.send({ message: "Method not allowed." });
  }
  const { firstName, lastName, emailAddress, password } = req.body;

  //Check if user exists in database
  const prevUser = await prisma.user.findUnique({
    where: { email: emailAddress },
  });

  if (prevUser) {
    return res.send({ user: null, message: "User already exists" });
  }

  // hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(firstName, lastName, emailAddress, hashedPassword);

  // Add user to database
  const user = await prisma.user.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      email: emailAddress,
      password: hashedPassword,
    },
  });

  return res.send({ user: user, message: "User added successfully." });
}