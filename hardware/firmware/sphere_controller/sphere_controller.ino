#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_AHRS.h>

// 按实际开发板修改引脚；常见 ESP32-S3 开发板可使用 8 / 9。
constexpr int SDA_PIN = 8;
constexpr int SCL_PIN = 9;
constexpr int CALIBRATE_BUTTON_PIN = 0;
constexpr uint8_t MPU6050_ADDRESS = 0x68;  // AD0 接 GND
constexpr uint32_t SERIAL_BAUD = 115200;
constexpr float SAMPLE_RATE_HZ = 100.0f;
constexpr uint32_t SAMPLE_INTERVAL_US = 10000;
constexpr uint32_t OUTPUT_INTERVAL_US = 33333;  // 约 30Hz
constexpr uint32_t BIAS_CALIBRATION_MS = 2000;
constexpr uint32_t BUTTON_DEBOUNCE_MS = 35;
constexpr float SHAKE_IMPULSE_THRESHOLD = 4.0f;  // 10ms 内加速度向量变化，单位 m/s²
constexpr uint32_t SHAKE_WINDOW_MS = 800;
constexpr uint32_t SHAKE_PEAK_GAP_MS = 90;
constexpr uint32_t SHAKE_COOLDOWN_MS = 1200;

Adafruit_MPU6050 mpu;
Adafruit_Mahony filter;

float gyroBiasX = 0.0f;
float gyroBiasY = 0.0f;
float gyroBiasZ = 0.0f;
uint32_t lastSampleUs = 0;
uint32_t lastOutputUs = 0;

int bootReading = HIGH;
bool bootPressed = false;
uint32_t bootChangedAt = 0;

float previousAccelX = 0.0f;
float previousAccelY = 0.0f;
float previousAccelZ = 0.0f;
bool previousAccelReady = false;
uint8_t shakePeaks = 0;
uint32_t shakeWindowStartedAt = 0;
uint32_t lastShakePeakAt = 0;
uint32_t lastShakeAt = 0;

void calibrateGyro() {
  Serial.println(F("STATUS: Keep the device still for 2 seconds."));

  sensors_event_t accel;
  sensors_event_t gyro;
  sensors_event_t temp;
  double sumX = 0.0;
  double sumY = 0.0;
  double sumZ = 0.0;
  uint32_t samples = 0;
  const uint32_t startedAt = millis();

  while (millis() - startedAt < BIAS_CALIBRATION_MS) {
    mpu.getEvent(&accel, &gyro, &temp);
    // Adafruit Unified Sensor 的陀螺仪单位已经是 rad/s。
    sumX += gyro.gyro.x;
    sumY += gyro.gyro.y;
    sumZ += gyro.gyro.z;
    ++samples;
    delay(10);
  }

  gyroBiasX = static_cast<float>(sumX / samples);
  gyroBiasY = static_cast<float>(sumY / samples);
  gyroBiasZ = static_cast<float>(sumZ / samples);
  Serial.println(F("STATUS: Gyroscope bias calibrated. Ready."));
}

void updateBootButton() {
  const int reading = digitalRead(CALIBRATE_BUTTON_PIN);
  if (reading != bootReading) {
    bootReading = reading;
    bootChangedAt = millis();
  }

  const bool pressed = bootReading == LOW;
  if (pressed != bootPressed && millis() - bootChangedAt >= BUTTON_DEBOUNCE_MS) {
    bootPressed = pressed;
    if (bootPressed) {
      Serial.println(F("{\"type\":\"calibrate\"}"));
    }
  }
}

void updateShakeDetection(float x, float y, float z) {
  if (!previousAccelReady) {
    previousAccelX = x;
    previousAccelY = y;
    previousAccelZ = z;
    previousAccelReady = true;
    return;
  }

  const float dx = x - previousAccelX;
  const float dy = y - previousAccelY;
  const float dz = z - previousAccelZ;
  previousAccelX = x;
  previousAccelY = y;
  previousAccelZ = z;

  const uint32_t now = millis();
  if (now - lastShakeAt < SHAKE_COOLDOWN_MS) {
    shakePeaks = 0;
    return;
  }

  const float impulse = sqrt(dx * dx + dy * dy + dz * dz);
  if (impulse <= SHAKE_IMPULSE_THRESHOLD || now - lastShakePeakAt < SHAKE_PEAK_GAP_MS) {
    return;
  }

  if (shakePeaks == 0 || now - shakeWindowStartedAt > SHAKE_WINDOW_MS) {
    shakePeaks = 1;
    shakeWindowStartedAt = now;
  } else {
    ++shakePeaks;
  }
  lastShakePeakAt = now;

  if (shakePeaks >= 2) {
    Serial.println(F("{\"type\":\"shake\"}"));
    shakePeaks = 0;
    lastShakeAt = now;
  }
}

void setup() {
  Serial.begin(SERIAL_BAUD);
  pinMode(CALIBRATE_BUTTON_PIN, INPUT_PULLUP);
  bootReading = digitalRead(CALIBRATE_BUTTON_PIN);
  bootChangedAt = millis();

  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(400000);

  if (!mpu.begin(MPU6050_ADDRESS, &Wire)) {
    while (true) {
      Serial.println(F("ERROR: MPU6050 not found at 0x68. Check wiring and AD0=GND."));
      delay(1000);
    }
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  filter.begin(SAMPLE_RATE_HZ);

  calibrateGyro();
  lastSampleUs = micros();
  lastOutputUs = lastSampleUs;
}

void loop() {
  updateBootButton();

  const uint32_t nowUs = micros();
  if (nowUs - lastSampleUs < SAMPLE_INTERVAL_US) {
    return;
  }

  const float dt = (nowUs - lastSampleUs) * 0.000001f;
  lastSampleUs = nowUs;

  sensors_event_t accel;
  sensors_event_t gyro;
  sensors_event_t temp;
  mpu.getEvent(&accel, &gyro, &temp);
  updateShakeDetection(
      accel.acceleration.x,
      accel.acceleration.y,
      accel.acceleration.z);

  filter.updateIMU(
      gyro.gyro.x - gyroBiasX,
      gyro.gyro.y - gyroBiasY,
      gyro.gyro.z - gyroBiasZ,
      accel.acceleration.x,
      accel.acceleration.y,
      accel.acceleration.z,
      dt);

  if (nowUs - lastOutputUs >= OUTPUT_INTERVAL_US) {
    lastOutputUs = nowUs;
    Serial.printf(
        "{\"type\":\"attitude\",\"r\":%.2f,\"p\":%.2f,\"y\":%.2f}\n",
        filter.getRoll(), filter.getPitch(), filter.getYaw());
  }
}
