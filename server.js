import express from "express";
import cors from "cors";
import multer from "multer";
import Web3 from "web3";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Readable } from "stream";
import pinataSDK from "@pinata/sdk";
import crypto from "crypto";

dotenv.config();

// ✅ Environment Variables Check
const requiredEnvVars = [
  "MONGO_URI",
  "PINATA_API_KEY",
  "PINATA_SECRET",
  "POLYGON_RPC_URL",
  "CONTRACT_ADDRESS",
  "WALLET_ADDRESS",
  "PRIVATE_KEY",
  "PORT",
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

// ✅ Initialize Express
const app = express();

// ✅ CORS Configuration (Allows access from anywhere)
app.use(
  cors({
    origin: "*", // 🔥 Allow access from any device
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000, // Prevents connection timeout issues
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ✅ Image Schema
const ImageSchema = new mongoose.Schema({
  ipfsHash: String,
  fileHash: String,
  uploader: String,
  timestamp: Number,
});
const ImageModel = mongoose.model("Image", ImageSchema);

// ✅ Initialize Pinata SDK
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET);

// ✅ Blockchain Setup
const web3 = new Web3(process.env.POLYGON_RPC_URL);
const contractABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "ipfsHash", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
      { indexed: false, internalType: "address", name: "uploader", type: "address" },
    ],
    name: "ImageStored",
    type: "event",
  },
  {
    inputs: [{ internalType: "string", name: "_ipfsHash", type: "string" }],
    name: "storeImage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);
const walletAddress = process.env.WALLET_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

// ✅ Multer for File Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Image Upload Route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("✅ Upload request received");
    console.log("📱 User-Agent:", req.headers["user-agent"]);
    console.log("🌍 Request Origin:", req.headers.origin);

    if (!req.file) {
      console.error("❌ No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("✅ Computing File Hash...");
    const fileHash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
    console.log("✅ File Hash Computed:", fileHash);

    // ✅ Upload to Pinata IPFS
    console.log("✅ Uploading to Pinata...");
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    const options = { pinataMetadata: { name: req.file.originalname }, pinataOptions: { cidVersion: 1 } };

    const file = await pinata.pinFileToIPFS(readableStream, options);
    console.log("✅ Pinata Upload Success:", file);
    const ipfsHash = file.IpfsHash;

    console.log("✅ Storing on Blockchain...");

    // ✅ Store on Blockchain
    const tx = contract.methods.storeImage(ipfsHash);
    const gas = await tx.estimateGas({ from: walletAddress });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(walletAddress);

    const signedTx = await web3.eth.accounts.signTransaction(
      { to: contractAddress, data, gas, gasPrice, nonce, chainId: 80002 },
      privateKey
    );

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("✅ Transaction Successful:", receipt.transactionHash);

    // ✅ Store in MongoDB with fileHash
    const newImage = new ImageModel({ ipfsHash, fileHash, uploader: walletAddress, timestamp: Date.now() });
    await newImage.save();

    res.json({ ipfsHash, fileHash, transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error("❌ Upload Error:", error.message);
    console.error("🔥 Full Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred" });
  }
});

// ✅ Image Verification Route
app.post("/verify", async (req, res) => {
  try {
    const { fileHash } = req.body;

    if (!fileHash) {
      return res.status(400).json({ error: "Missing file hash" });
    }

    console.log("✅ Received File Hash for Verification:", fileHash);

    // ✅ Search for Matching Hash in MongoDB
    const imageRecord = await ImageModel.findOne({ fileHash });

    if (!imageRecord) {
      return res.json({ match: false, message: "❌ No matching image found in database." });
    }

    res.json({ match: true, message: "✅ Image is authentic and matches the stored record.", ipfsHash: imageRecord.ipfsHash });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Server Health Check Route
app.get("/", (req, res) => {
  res.send("🚀 Sindh Police Blockchain API is running!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
