const admindata = require("../env");
const productModel = require("../model/productmodel");
const transporter = require("../validator/nodemailer");
const usermodel = require("../model/usermodel");
const OTP = require("../model/otpmodel");
const otpfunctions = require("../validator/otp");
const bcrypt = require("bcrypt");
const nodemailer = require("../validator/nodemailer");
const userAuth = require("../middlewares/userauth");
const categoryModel = require("../model/categorymodel");
const brandModel = require("../model/brandmodel");
const cartModel = require("../model/cartmodel");
const orderModel = require("../model/ordermodel");
const reviewModel = require("../model/reviewmodel");
const { default: mongoose } = require("mongoose");
const bannermodel = require('../model/bannermodel')
const moment = require('moment')
const couponmodel = require('../model/couponmodel')
const {v4:uuidv4} = require('uuid')

//for displaying userhome
const viewproduct = async (req, res) => {

  const product = await productModel.find({ Display: "Active" });
  const category = await categoryModel.find({ Status: "Active" });
  console.log(req.session.user, "this is user");
  const currentBanner = await bannermodel.findOne({Status:'Enabled'})
  console.log(req.session.user);
  const userEmail = req?.session?.user?.email
  const user = await usermodel.findOne({email:userEmail})
  if(user){
    if (product) {
      res.render("user/home", { product, user, category,currentBanner });
    } else {
      res.render("user/home", { product, user, category,currentBanner });
    }
  }else{
    res.render("user/home", { product, user, category,currentBanner });

  }
  
  
};

//userlogin-get
const login = async (req, res) => {
  if (req.session.user) {
    res.redirect("/home");
  } else {
    res.render("user/login", { messages: req.flash() });
  }
};

//post - userlogin
const postlogin = async (req, res) => {
  // console.log(req.body);
  try {
    const user = await usermodel.findOne({ email: req.body.email });
    if (user.Status == "Active") {
      if (user) {
        passwordmatch = await bcrypt.compare(req.body.password, user.password);
        console.log(req.body.password);
        if (passwordmatch) {
          req.session.userAuth = true;
          req.session.user = user;
          console.log("test");
          res.redirect("/home");
        } else {
          req.flash("error", "the password or email doesnot match");
          res.redirect("/login");
        }
      } else {
        req.flash("error", "the email or password does not match");
        res.redirect("/login");
      }
    } else {
      req.flash("error", "you are Banned by the admin");
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/login");
  }
};

// usersignup
const signup = async (req, res) => {
  res.render("user/signup", { messages: req.flash() });
};

const getreferelsignup = async(req,res) =>{
  // console.log(req.url,"karthik");
  req.session.url = req.url;
  res.render('user/signup')
}

///post signup
const logged = async (req, res) => {
  try {
    
    

    password = req.body.password;
    const saltrounds = 10;
    const salt = await bcrypt.genSalt(saltrounds);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    req.body.confirmpassword = await bcrypt.hash(
      req.body.confirmpassword,
      salt
    );

    const user = req.body;
    const email = req.body.email;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const validEmail = emailRegex.test(email);

    if (validEmail) {
      if (req.body.password === req.body.confirmpassword) {
        // if(req.body.password == req.body.confirmpassword)
        const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\]/;
        const numberRegex = /\d/;
        const containsSpecialChar = specialCharRegex.test(password);
        const containsNumber = numberRegex.test(password);
        const hasMinimumLength = req.body.password.length >= 8;

        if (containsSpecialChar) {
          if (containsNumber) {
            if (hasMinimumLength) {
              req.session.user = req.body;
              req.session.email = req.body.email;
              console.log(req.session.user);

              const existinguser = await usermodel.findOne({
                email: req.body.email,
              });
              if (existinguser) {
                req.flash("error", "email already exist");
                console.log("email already exist" + error);
                res.redirect("/signup");
                // res.send("email already exist");
              } else {
                const otpToBeSent = otpfunctions.generateOTP();
                const result = otpfunctions.sendOTP(
                  req,
                  res,
                  email,
                  otpToBeSent
                );
                //    res.send("new page")
              }
            } else {
              req.flash("error", "password must have 8 letters");
              res.redirect("/signup");
            }
          } else {
            req.flash("error", "password not contains number");
            res.redirect("/signup");
          }
        } else {
          req.flash("error", "password not contains special characters");
          res.redirect("/signup");
        }
      } else {
        req.flash("error", "password doesnt match");
        res.redirect("/signup");
      }
    } else {
      req.flash("error", "email not correct");
      res.redirect("/signup");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/signup");
  }
};

//     if(req.body.password == req.body.confirmpassword) {
//         if(validEmail){
//             req.session.user = req.body
//             req.session.email = req.body.email
//             console.log(req.session.user);

//             const existinguser = await usermodel.findOne({email:req.body.email})
//             if(existinguser) {
//                 req.flash('error',"email already exist")
//                 console.log("email already exist" +error);
//                 res.redirect('/signup')
//                 // res.send("email already exist")
//             } else{
//                const otpToBeSent = otpfunctions.generateOTP()
//                const result = otpfunctions.sendOTP(req,res,email,otpToBeSent)
//             //    res.send("new page")
//             }
//         } else{
//             console.log("error is here");
//             req.flash('error',"invalid emailaddress")
//             res.redirect('/signup')
//         }
//     } else {
//         console.log("error is here 2");
//         req.flash('error',"password doesnt match")
//         res.redirect('/signup')
//         // res.send("password doesnt match")
//     }

const getemailverification = async (req, res) => {
  res.render("user/emailverification", {
    messages: req.flash(),
    user: req.session.user,
  });
};

const otpAuth = async (req, res, next) => {
  try {
    let { otp } = req.body;
    console.log(req.session.user.email,"inside the session");

    const matchedotprecord = await OTP.findOne({
      email: req.session.user.email,
    });

    if (!matchedotprecord) {
      throw new Error("no otp records found for given mail");
    }

    const { expiresAt } = matchedotprecord;

    //checking for expired otps

    if (expiresAt < Date.now()) {
      await OTP.deleteOne({ email });
      throw new Error("the OTP code has expired please request a new one");
    }

    const dbOTP = matchedotprecord.otp;
    if (otp == dbOTP) {
      req.session.otpvalid = true;
      console.log("dbotp");
      next();
    } else {
      //invalid otp
      console.log("INVALID");
      req.flash("error", "OTP IS INVALID");
      res.redirect("/emailverification");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/signup");
  }
};

const postemailverification = async (req, res) => {
  try {
    console.log("reached postemail");
    const user = await usermodel.create(req.session.user);
    const userUuid = uuidv4();
    const uuid = await usermodel.findOneAndUpdate({_id:user._id},{$set:{userUuid:userUuid}},{new:true})
    console.log(uuid,"uuid of the user");
    // console.log(user);
    req.session.user = user;
    req.session.userAuth = true;
    
    if(req.session.url && req.session.url.startsWith('/signup/')) {
      console.log(req.session.url,"karthik brocamp");
      const id = req.session.url.split('/').pop();
      if(mongoose.Types.ObjectId.isValid(id)) {
        const referenceUser = await usermodel.findOne({_id:id});
        if(referenceUser){
          const increment = 100;
          // await usermodel.findOneAndUpdate({_id:id},{$inc:{WalletAmount:100}})
          const walletTransaction = {
            orderId  : 'Refferel',
            Status: 'Credited',
            Date:new Date(),
            Amount: increment,
            OrderDetails:'referrel',
            
        }
        console.log(walletTransaction,"wallet transactions");
        console.log("hai reached");
        const user = await usermodel.findByIdAndUpdate(id,{$inc:{WalletAmount:increment},$push:{walletTransactions:walletTransaction}},{new:true})



        }else{
          console.log("no refernce user found");
        }
      }else{
        console.log("invalid id format");
    }
    }
  

    if (user) {
      res.redirect("/home");
    }
  } catch (error) {
    res.redirect("/signup");
  }
};

const resendotp = async (req, res) => {
  // console.log("test");
  try {
    console.log(req.session.user);
    const email = req.session.user.email;
    const otpToBeSent = otpfunctions.generateOTP();
    console.log("test1");
    const result = otpfunctions.sendOTP(req, res, email, otpToBeSent);
  } catch (error) {
    console.log(error);
    req.flash("error", "error sending resend otp");
    res.redirect("/emailverification");
  }
};

const getforgotpassword = async (req, res) => {
  res.render("user/forgotpassword", {
    messages: req.flash(),
    user: req.session.user,
  });
};

const postforgotpassword = async (req, res) => {
  try {
    console.log(req.body);
    email = req.body.email;

    const matchedemail = await usermodel.find({ email: req.body.email });
    if (matchedemail) {
      req.session.email = email;
      // req.session.user = matchedemail
      const otpToBeSent = otpfunctions.generateOTP();
      const result = otpfunctions.forgotOTP(req, res, email, otpToBeSent);
    } else {
      req.flash("error", "no user exist");
      res.redirect("user/forgotpasscheck");
    }
  } catch (error) {
    console.log(error);
  }
};

const getforgototp = async (req, res) => {
  try {
    res.render("user/forgototp");
  } catch (error) {
    req.flash("error", "not getting the page");
    res.redirect("/forgotpassword");
  }
};

const postforgototp = async (req, res) => {
  try {
    console.log(req.body);
    // console.log(email);
    const matchedotp = await OTP.findOne({ email: req.session.email });

    req.session.user = matchedotp;

    console.log(matchedotp);
    const dbotp = matchedotp.otp;
    console.log(dbotp);
    console.log(req.body);
    if (dbotp == req.body.otp) {
      res.redirect("/forgotpasscheck");
    } else {
      req.flash("error", "the entered otp is incorrect");
      console.log("entered otp is incorrect");
    }
  } catch {
    res.redirect("/forgotpassword");
  }
};

const getforgotpasscheck = async (req, res) => {
  try {
    res.render("user/forgotpasscheck", { email: req.body.email });
  } catch (error) {
    console.log(error);
    req.flash("error", "the entered otp is not correct");
    res.redirect("/forgotpassword");
  }
};

const postforgotpasscheck = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.body.newpassword);
    console.log(req.session.email);
    // console.log(email);
    if (req.body.newpassword == req.body.confirmpassword) {
      req.body.newpassword = await bcrypt.hash(req.body.newpassword, 10);
      // req.body.confirmpassword = await bcrypt.hash(req.body.confirmpassword,salt);
      const updatepassword = await usermodel.findOneAndUpdate(
        { email: req.session.email },
        { $set: { password: req.body.newpassword } }
      );
      console.log("succesfully changed password");
      const user = await usermodel.findOne({ email: req.session.email });
      console.log(user, "here is the userr");
      req.session.user = user;
      req.session.userAuth = true;
      res.redirect("/home");
    } else {
      req.flash("error", "the password doesnot match");
      console.log("password doesnot match");
    }
  } catch (error) {
    req.flash("error", "the passwords are not same");
    res.redirect("/forgotpassword");
  }
};

const getproduct = async (req, res) => {
  try {
    // console.log(req.params.id);
    let neworder = false;
    const product = await productModel.findOne({ _id: req.params.id });
    if (!product) {
      res.send("product not found");
    }
    // console.log(product);
    const order = await orderModel.find({
      userId: req.session.user._id,
      products: { $elemMatch: { productId: req.params.id } },
      Status: "Delivered",
    });
    const Reviews = await reviewModel
      .find({ productId: req.params.id })
      .populate("userId");
    // console.log('params id ',req.params.id);
    const reviewNum = await reviewModel.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(req.params.id),
        },
      },{$group:{_id:null,avgRating:{$avg:'$rating'}}}
    ]);

    // const avgRating = Math.ceil(reviewNum[0].avgRating)
    const avgRating = reviewNum && reviewNum[0] ? Math.ceil(reviewNum[0].avgRating) : 0;

    // console.log(avgRating,"number of stars");
    const reviews = Reviews.map((review) => {
      if (review.rating == 1) {
        review.ratings = [true, false, false, false, false];
      } else if (review.rating == 2) {
        review.ratings = [true, true, false, false, false];
      } else if (review.rating == 3) {
        review.ratings = [true, true, true, false, false];
      } else if (review.rating == 4) {
        review.ratings = [true, true, true, true, false];
      } else if (review.rating == 5) {
        review.ratings = [true, true, true, true, true];
      }
      return {
        name: review.userId.name,
        reviewText: review.reviewText,
        ratings: review.ratings,
      };
    });
    // console.log(reviews,'reviewss');
    if (order.length > 0) {
      neworder = true;
    }

    const reviewExist = await reviewModel.findOne({productId:req.params.id,userId:req.session.user._id})

    console.log(neworder, "2");
    res.render("user/productdescription", {
      product,
      user: req.session.user,
      neworder,
      reviews,
      avgRating,
      reviewExist
    });
  } catch (error) {
    console.log(error);
  }
};




const getusershop = async (req, res) => {
  console.log("test");
  console.log(req.url);
  const id = req.params.id;
  const user = req.session.user;

  try {
    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
    const perPage = 10; // Number of items per page
    const skip = (page - 1) * perPage;
    console.log(req.url, "inside getshop", req.query);

    // const user = await usermodel.find().skip(skip).limit(perPage);
    const totalCount = await productModel.countDocuments();
    if (req.url === "/usershop" || req.query?.sort) {
      const categories = await categoryModel.find();
      const brands = await brandModel.find();

      const sortOption = req.query.sort || "default";
      console.log(sortOption);
      let products;
      switch (sortOption) {
        case "nameAsc":
          products = await productModel
            .find()
            .sort({ ProductName: 1 })
            .skip(skip)
            .limit(perPage);
          break;
        case "nameDesc":
          products = await productModel
            .find()
            .sort({ ProductName: -1 })
            .skip(skip)
            .limit(perPage);
          break;
        case "priceAsc":
          products = await productModel
            .find()
            .sort({ Price: 1 })
            .skip(skip)
            .limit(perPage);
          break;
        case "priceDesc":
          products = await productModel
            .find()
            .sort({ Price: -1 })
            .skip(skip)
            .limit(perPage);
          break;
        default:
          products = await productModel
            .find({ Display: "Active" })
            .skip(skip)
            .limit(perPage);
      }
      // const products = await productModel.find({Display:'Active'}).skip(skip).limit(perPage)
      res.render("user/shop", {
        user,
        categories,
        brands,
        products,
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
    
      });
    } else if (req.url === `/usershop/category/${id}`) {
      console.log("testing");
      const categories = await categoryModel.find();
      const brands = await brandModel.find();
      console.log(req.params.id);
      const products = await productModel.find({
        category: req.params.id,
        Display: "Active",
      });
      res.render("user/shop", {
        user,
        categories,
        brands,
        products,
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      });
    } else if (req.url == `/usershop/brand/${id}`) {
      const categories = await categoryModel.find();
      const brands = await brandModel.find();
      const products = await productModel.find({
        BrandName: req.params.id,
        Display: "Active",
      });
      res.render("user/shop", {
        user,
        categories,
        brands,
        products,
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const logout = async (req, res) => {
  try {
    req.session.userAuth = false;
    req.session.user = null;
    res.redirect("/home");
  } catch (error) {
    console.log(error);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await usermodel.findOne({ _id: req.session.user._id });
    // console.log(user);
    if (user) {
      res.render("user/profile", { user: user, message: req.flash() });
    } else {
      console.log("user not found");
    }
  } catch (error) {
    console.log(error);
  }
};

const getaddress = async (req, res) => {
  try {
    const user = await usermodel.findOne({ _id: req.session.user._id });
    if (user) {
      res.render("user/address", { user: user, message: req.flash() });
    } else {
      throw new Error("user not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const postaddaddress = async (req, res) => {
  try {
    // console.log(req.session.user);
    console.log(req.body);
    // console.log("karthik p p");
    const user = await usermodel.findOneAndUpdate(
      { _id: req.session.user._id },
      { $push: { Address: req.body } }
    );
    console.log(user);
    if (user) {
      console.log("hai");
      req.flash("added", "new address added succesfully");
      res.redirect("/address");
    } else {
      req.flash("notFound", "the user is not found");
      res.redirect("/address");
    }
  } catch (error) {
    console.log(error);
  }
};

const posteditaddress = async (req, res) => {
  try {
    // console.log(req.body);
    // console.log(req.session.user);
    console.log(req.params.id);
    console.log(req.body);
    const updateduser = await usermodel.findOneAndUpdate(
      { _id: req.session.user._id, "Address._id": req.params.id },
      { $set: { "Address.$": req.body } },
      { new: true }
    );
    if (updateduser) {
      req.flash("updated", "address updated succesfully");
      res.redirect("/address");
    } else {
      req.flash("updated", "address updated succesfully");
    }
  } catch (error) {
    console.log(error);
  }
};

const getdeleteaddress = async (req, res) => {
  try {
    console.log(req.session.user);
    console.log(req.params.id);
    const user = await usermodel.findOneAndUpdate(
      { _id: req.session.user._id },
      { $pull: { Address: { _id: req.params.id } } }
    );
    console.log(user);

    if (!user) {
      req.flash("deleted", "user not found");
      res.redirect("/address");
    } else if (user) {
      req.flash("deleted", "address deleted succesfully");
      res.redirect("/address");
    } else {
      console.log("user not found");
      res.json("404");
    }
  } catch (error) {
    console.log(error);
  }
};

const getaddaddresscheckout = async (req, res) => {
  try {
    // console.log(req.body);
    // console.log(req.session.user._id);
    const user = await usermodel.findOneAndUpdate(
      { _id: req.session.user._id },
      { $push: { Address: req.body } }
    );
    // console.log(user);
    res.redirect("/checkout");
  } catch (error) {
    console.log(error);
  }
};

const getUserWallet = async (req, res) => {
  try {
    const user = await usermodel.findOne({ _id: req.session.user._id });
    
    res.render("user/userwallet", { user,moment});
  } catch (error) {
    console.log(error);
  }
};

const postEditProfile = async(req,res) =>{
  try{
    console.log(req.body);
    console.log(req.body.Name);
    const user = await usermodel.findOneAndUpdate({_id:req.session.user._id},{name:req.body.Name})
    res.redirect('/profile')
  }catch(error){
    console.log(error);
  }
}

const getuserCoupons = async(req,res) =>{
  try{
    const user = await usermodel.findOne({_id:req.session.user._id})
    const offers = await couponmodel.find({Status:'Active'})
    res.render('user/usercoupons',{user,offers,moment})
  }catch(error){
    console.log(error);
  }
}


const navbarsearch = async (req, res) => {
  try {
    const { search } = req.body;
    const regex = new RegExp(search, 'i');
    const productDetails = await productModel.find({ tags: regex, Display: 'Active' });

    if (productDetails.length === 0) {
      res.render('user/noresults'); // Create a 'noresults' view for indicating no search results
      return;
    }

    res.render('user/usershop', { productDetails });
  } catch (error) {
    console.log(error);
    res.render('error', { error });
  }
};


module.exports = {
  viewproduct,
  login,
  postlogin,
  signup,
  logged,
  getemailverification,
  otpAuth,
  postemailverification,
  resendotp,
  getforgotpassword,
  postforgotpassword,
  getforgototp,
  postforgototp,
  getforgotpasscheck,
  postforgotpasscheck,
  getproduct,
  getusershop,
  logout,
  getProfile,
  postaddaddress,
  posteditaddress,
  getdeleteaddress,
  getaddaddresscheckout,
  getUserWallet,
  getaddress,
  postEditProfile,
  getuserCoupons,
  getreferelsignup,
  navbarsearch
};
