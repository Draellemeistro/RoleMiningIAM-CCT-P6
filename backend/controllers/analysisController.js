import AnalysisService from '../services/AnalysisService.js';

const testAnalysis = async (req, res) => {
  const depIds = [1, 2];
  try {
    const depComponents = await AnalysisService.testMiner(depIds);
    res.status(200).json(depComponents);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
    res.status(500).json({ error: "Failed to analyze the specified departments" });
  }
}

const testAnalysisAgain = async (req, res) => {
  const depIds = [1];
  try {
    const depComponents = await AnalysisService.testMiner2(depIds);
    res.status(200).json(depComponents);
  } catch (error) {
    console.error("Error analyzing roles:", error.message);
    res.status(500).json({ error: "Failed to analyze the specified departments" });
  }
}

export default {
  testAnalysis,
  testAnalysisAgain,
};
