const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const analyzeResumeWithGemini = require('./gemini');

const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.post('/analyze', async (req, res) => {
  try {
    const resumeFile = req.files?.resume;
    if (!resumeFile) return res.status(400).send('No resume uploaded');

    const data = await pdfParse(resumeFile.data);
    const resumeText = data.text;

    // Get structured output from Gemini
    const analysis = await analyzeResumeWithGemini(resumeText);

    // Extract job title from the analysis (first line)
    const jobTitle = analysis.split('\n')[0];

    const jobs = await scrapeJobs(jobTitle, 'India');

    res.json({ keyword: jobTitle, jobs, analysis });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing resume or fetching jobs');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => console.log(`Backend running on http://0.0.0.0:${PORT}`));
