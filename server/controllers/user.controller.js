import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import tokenBlackList from "../models/blackList.model.js";


export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Something is missing. Please check!",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "Email already used, try another one",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });



    const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "3d",
    });
    
    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Account created successfully",
        success: true,
        token: token, // Send token in response body for frontend
      });

  } 
  catch (error) {
    
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Something is missing!",
        success: false,
      });
    }

    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "3d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        token: token, // Send token in response body for frontend
        username: user.username,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const logout = async (req,res)=>{

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if(!token){
    return res.status(200).json({
      message:"User logged out successfully"
    })
  }

  await tokenBlackList.create({
    token:token,
  })

  res.clearCookie("token")

  return res.status(200).json({
    message:"User logged out"
  })
}