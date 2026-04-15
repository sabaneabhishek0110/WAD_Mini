import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

// Multer config: store in memory for CSV processing
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Parse CSV buffer to array of objects
export const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csvParser({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (data) => {
        // Trim all values
        const trimmed = {};
        for (const [key, value] of Object.entries(data)) {
          trimmed[key] = typeof value === 'string' ? value.trim() : value;
        }
        results.push(trimmed);
      })
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};
