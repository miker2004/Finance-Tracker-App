import express, { Request, Response, NextFunction } from "express";
import FinancialRecordModel from "../schema/financial-record";

const router = express.Router();

// Middleware to handle async errors
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Get all records by user ID
router.get("/getAllByUserID/:userId", asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const records = await FinancialRecordModel.find({ userId });
  if (records.length === 0) {
    return res.status(404).json({ message: "No records found for the user." });
  }
  res.status(200).json(records);
}));

// Create a new record
router.post("/", asyncHandler(async (req: Request, res: Response) => {
  const newRecordBody = req.body;
  const newRecord = new FinancialRecordModel(newRecordBody);
  const savedRecord = await newRecord.save();
  res.status(201).json(savedRecord);
}));

// Update an existing record
router.put("/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const newRecordBody = req.body;

  if (!newRecordBody || Object.keys(newRecordBody).length === 0) {
    return res.status(400).json({ message: "Request body is empty." });
  }

  const record = await FinancialRecordModel.findByIdAndUpdate(
    id,
    newRecordBody,
    { new: true }
  );

  if (!record) return res.status(404).json({ message: "Record not found." });
  res.status(200).json(record);
}));

// Delete a record by ID
router.delete("/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const record = await FinancialRecordModel.findByIdAndDelete(id);

  if (!record) return res.status(404).json({ message: "Record not found." });
  res.status(204).send(); // No content needed after successful delete
}));

// Error handling middleware
router.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const errorMessage = (err instanceof Error) ? err.message : "Server Error";
  res.status(500).json({ error: errorMessage });
});

export default router;
