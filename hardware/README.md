# ESP32-S3 + MPU6050 球形首页姿态控制硬件说明

本目录记录路演球体网站所使用的姿态控制硬件、接线方式和成功运行的 Arduino 固件入口，方便其他人复现或后续维护。

## 1. 硬件清单

| 部件 | 型号 / 说明 | 数量 | 备注 |
| --- | --- | --- | --- |
| 主控开发板 | ESP32-S3 开发板 | 1 | 具体板身型号请按开发板丝印补全，例如 ESP32-S3-DevKitC-1 / N16R8 等。 |
| 姿态传感器 | MPU6050 六轴 IMU 模块 | 1 | 内置三轴加速度计和三轴陀螺仪。 |
| USB 线 | 支持数据传输的 USB 线 | 1 | 仅供电线无法被网页串口识别。 |
| 杜邦线 | 母对母或按实际模块选择 | 若干 | 连接 MPU6050 与 ESP32-S3。 |

> 若需要在仓库中标注更精确的主控型号，请提供开发板丝印照片或型号文字后再补充，避免把猜测写入文档。

## 2. 功能链路

`MPU6050 → ESP32-S3 姿态融合 → USB 串口 JSON → 网页 remote-control.js → experience.js 球体 / 详情控制`

固件以约 100Hz 采样，约 30Hz 向网页输出姿态角：

```json
{"type":"attitude","r":12.4,"p":-8.2,"y":93.1}
```

当前网页控制映射：

- 首页球体：`R` 接管左右连续旋转，`P` 控制前后连续旋转。
- 详情页：`R` 控制左右滑动，`P` 控制上下滑动。
- `Y` 目前只保留读数和校准检测，不直接驱动页面。

## 3. 接线方式

以当前成功固件为准：

| MPU6050 引脚 | ESP32-S3 引脚 | 说明 |
| --- | --- | --- |
| `VCC` | `3.3V` | 必须使用 3.3V，不要接 5V。 |
| `GND` | `GND` | 共地。 |
| `SDA` | `GPIO8` | I²C 数据线。 |
| `SCL` | `GPIO9` | I²C 时钟线。 |
| `AD0` | `GND` | I²C 地址固定为 `0x68`。 |

板载 `BOOT` 键对应 `GPIO0`，在首页用于触发网页校准流程。

对应固件配置位于：

[hardware/firmware/sphere_controller/sphere_controller.ino](../hardware/firmware/sphere_controller/sphere_controller.ino)

```cpp
constexpr int SDA_PIN = 8;
constexpr int SCL_PIN = 9;
constexpr int CALIBRATE_BUTTON_PIN = 0;
constexpr uint8_t MPU6050_ADDRESS = 0x68;  // AD0 接 GND
```

## 4. 成功运行的固件

固件入口：

[hardware/firmware/sphere_controller/sphere_controller.ino](../hardware/firmware/sphere_controller/sphere_controller.ino)

主要能力：

- 初始化 MPU6050。
- 启动时静止 2 秒校准陀螺仪零偏。
- 使用 Mahony 融合输出 `roll / pitch / yaw`。
- 通过 USB 串口输出 JSON 姿态数据。
- 检测板载 BOOT 键按下，发送校准事件。
- 内置加速度剧烈变化检测，输出 `shake` 事件，供后续网页交互扩展使用。

## 5. 烧录准备

开发环境：

- Arduino IDE 或 Arduino CLI
- ESP32 Arduino Core
- Adafruit MPU6050
- Adafruit Unified Sensor
- Adafruit AHRS

参考开发板选择：

```text
esp32:esp32:esp32s3
```

串口波特率：

```text
115200
```

参考编译命令：

```powershell
arduino-cli compile --fqbn esp32:esp32:esp32s3 hardware/firmware/sphere_controller
```

烧录前先关闭浏览器网页连接和 Arduino 串口监视器，避免 COM 口被占用。

## 6. 网页使用

设备版入口：

```text
sphere/index.html?device=1
```

需要使用支持 Web Serial 的浏览器，例如 Chrome 或 Edge。连接后选择对应的 ESP32-S3 串口，即可在首页和详情页使用姿态控制。

## 7. 安全与注意事项

- MPU6050 使用 `3.3V` 供电，避免接错电压损坏模块。
- 接线前确认开发板断电，防止误接短路。
- USB 线必须支持数据传输，否则浏览器看不到串口设备。
- 同一个串口只能被一个程序占用；Arduino 串口监视器、浏览器设备页、其他调试工具不要同时打开。
- 若更换 ESP32-S3 开发板导致 I²C 引脚不同，只需修改固件顶部的 `SDA_PIN` 和 `SCL_PIN`。
