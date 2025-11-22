// Time-Series Forecasting & Predictive Analytics
import * as tf from "@tensorflow/tfjs";
import { ForecastResult, AnomalyDetection, MonteCarloResult } from "@/lib/types/enterprise";

export class ForecastingService {
  private model: tf.LayersModel | null = null;

  async buildLSTMModel(
    lookbackWindow: number = 30,
    lstmUnits: number = 64,
    dropoutRate: number = 0.2,
    learningRate: number = 0.001
  ): Promise<tf.LayersModel> {
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: lstmUnits,
          returnSequences: true,
          inputShape: [lookbackWindow, 1],
        }),
        tf.layers.dropout({ rate: dropoutRate }),
        tf.layers.lstm({
          units: Math.floor(lstmUnits / 2),
          returnSequences: false,
        }),
        tf.layers.dropout({ rate: dropoutRate }),
        tf.layers.dense({ units: 16, activation: "relu" }),
        tf.layers.dense({ units: 1 }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: "meanSquaredError",
      metrics: ["mae"],
    });

    return this.model;
  }

  normalizeData(values: number[]): { normalized: number[]; mean: number; std: number } {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    const normalized = values.map((v) => (v - mean) / (std + 1e-8));

    return { normalized, mean, std };
  }

  denormalize(normalized: number[], mean: number, std: number): number[] {
    return normalized.map((v) => v * std + mean);
  }

  createTimeWindows(
    data: number[],
    windowSize: number = 30
  ): { inputs: number[][]; outputs: number[] } {
    const inputs: number[][] = [];
    const outputs: number[] = [];

    for (let i = 0; i < data.length - windowSize; i++) {
      inputs.push(data.slice(i, i + windowSize));
      outputs.push(data[i + windowSize]);
    }

    return { inputs, outputs };
  }

  async trainLSTM(
    data: number[],
    windowSize: number = 30,
    epochs: number = 50
  ): Promise<void> {
    const { normalized, mean, std } = this.normalizeData(data);
    const { inputs, outputs } = this.createTimeWindows(normalized, windowSize);

    const inputTensor = tf.tensor3d(
      inputs.map((i) => i.map((v) => [v])),
      [inputs.length, windowSize, 1]
    );
    const outputTensor = tf.tensor2d(
      outputs.map((o) => [o]),
      [outputs.length, 1]
    );

    if (!this.model) {
      await this.buildLSTMModel(windowSize);
    }

    await this.model!.fit(inputTensor, outputTensor, {
      epochs,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      verbose: 0,
    });

    inputTensor.dispose();
    outputTensor.dispose();
  }

  async forecast(
    data: number[],
    horizon: number = 10,
    windowSize: number = 30
  ): Promise<ForecastResult> {
    const { normalized, mean, std } = this.normalizeData(data);

    if (!this.model) {
      await this.trainLSTM(data, windowSize);
    }

    const predictions: number[] = [];
    let currentWindow = normalized.slice(-windowSize);

    for (let i = 0; i < horizon; i++) {
      const tensor = tf.tensor3d([currentWindow.map((v) => [v])], [1, windowSize, 1]);
      const pred = this.model!.predict(tensor) as tf.Tensor;
      const value = (await pred.data())[0];
      predictions.push(value);
      currentWindow = [...currentWindow.slice(1), value];

      pred.dispose();
      tensor.dispose();
    }

    const denormalizedPreds = this.denormalize(predictions, mean, std);

    // Calculate confidence intervals (simple approach using std)
    const lower = denormalizedPreds.map((p) => p - 1.96 * std);
    const upper = denormalizedPreds.map((p) => p + 1.96 * std);

    return {
      predictions: denormalizedPreds,
      confidenceIntervals: { lower, upper },
      metadata: {
        model: "LSTM",
        horizon,
        trainedOn: data.length,
        mse: 0, // Would calculate from validation
        mae: 0,
      },
    };
  }

  detectAnomalies(values: number[], threshold: number = 3): AnomalyDetection {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    const anomalies = values
      .map((val, index) => ({
        index,
        value: val,
        score: Math.abs((val - mean) / (std + 1e-8)),
        timestamp: new Date(Date.now() - (values.length - index) * 86400000),
        reason: "",
      }))
      .filter((item) => item.score > threshold)
      .map((item) => ({
        ...item,
        reason: item.value > mean ? "Unusually high value" : "Unusually low value",
      }));

    return {
      anomalies,
      method: "statistical",
    };
  }

  monteCarloSimulation(
    startPrice: number,
    expectedReturn: number,
    volatility: number,
    simulations: number = 1000,
    periods: number = 252
  ): MonteCarloResult {
    const paths: number[][] = [];
    const finalPrices: number[] = [];

    const dt = 1 / 252;
    const sqrtDt = Math.sqrt(dt);

    for (let sim = 0; sim < simulations; sim++) {
      const path: number[] = [startPrice];
      let currentPrice = startPrice;

      for (let t = 1; t <= periods; t++) {
        const z = this.normalRandom();
        const drift = expectedReturn * dt;
        const diffusion = volatility * sqrtDt * z;

        currentPrice =
          currentPrice *
          Math.exp(drift - (volatility * volatility * dt) / 2 + diffusion);
        path.push(currentPrice);
      }

      paths.push(path);
      finalPrices.push(currentPrice);
    }

    finalPrices.sort((a, b) => a - b);

    const mean = finalPrices.reduce((a, b) => a + b) / finalPrices.length;
    const variance =
      finalPrices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / finalPrices.length;
    const std = Math.sqrt(variance);

    const getPercentile = (p: number) =>
      finalPrices[Math.floor((p / 100) * finalPrices.length)];

    return {
      simulations,
      paths,
      statistics: {
        mean,
        std,
        percentile5: getPercentile(5),
        percentile25: getPercentile(25),
        percentile50: getPercentile(50),
        percentile75: getPercentile(75),
        percentile95: getPercentile(95),
        valueAtRisk: (startPrice - getPercentile(5)) / startPrice,
        expectedShortfall:
          (startPrice -
            finalPrices
              .slice(0, Math.ceil(finalPrices.length * 0.05))
              .reduce((a, b) => a + b, 0) /
              Math.ceil(finalPrices.length * 0.05)) /
          startPrice,
      },
    };
  }

  private normalRandom(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
    }
  }
}

export const forecastingService = new ForecastingService();
