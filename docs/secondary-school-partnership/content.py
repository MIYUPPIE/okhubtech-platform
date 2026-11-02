"""Single source of truth for the secondary-school partnership document.

Everything the tests check (prices, chapters, discount maths) lives here as data,
so build.py renders it and test_document.py verifies it against the originals
(the customer catalogue PDF and the book PDF) without re-typing any number.
"""

# ---------------------------------------------------------------- catalogue --
# Source: assets/OkhubTech-CUSTOMER-Catalog-2024.pdf. Naira. `price` is the
# selling price, `list` the struck-through price, `variants` the printed extras.
KITS = {
    "ignite": dict(
        name="Ignite Genesis", tag="Most complete starter kit", price=65500, list=78000,
        img="c-000", stage="JSS1-JSS2", chapters="4, 5, 6",
        has="Arduino UNO R3 and Mega compatible board, LCD 1602, DHT11, IR remote, joystick, servo, stepper and driver, 7-segment, buzzer, LEDs, resistors, buttons, breadboard, power module",
        covers="Electronics, first board, first sketches. 50+ projects with tutorial, code and videos.",
    ),
    "sentinel": dict(
        name="Sentinel RFID Lab", tag="Smart security kit", price=60500, list=72000,
        img="c-001", stage="SS1-SS2", chapters="9",
        has="RFID RC522 reader with 2 cards and key fob, 4x4 keypad, relay module, servo for a door lock, LCD 1602, IR remote, buzzer",
        covers="RFID, relay and LCD projects: door access, attendance, smart safe.",
    ),
    "sensorverse": dict(
        name="Sensorverse 22", tag="22-in-1 sensor kit", price=38000, list=45000,
        img="c-002", stage="JSS2-JSS3", chapters="7, 8",
        variants="With Arduino UNO: 58,500",
        has="22 modules including PIR, ultrasonic, soil, flame, touch, rain, sound, hall effect, vibration, IR tracking, laser, DS18B20, water level, tilt, with Dupont cables",
        covers="Most of the sensor projects: weather station, smart farm, intruder alarm.",
        uno_price=58500,
    ),
    "rover_m2": dict(
        name="Rover M2", tag="2WD smart robot car", price=45500, list=55000,
        img="c-003", stage="JSS3-SS1", chapters="12, 13",
        variants="With UNO: 68,000. WiFi version: 80,000",
        has="2WD acrylic chassis, TT motors and wheels, L298N motor driver, ultrasonic sensor, IR line-tracking and obstacle modules, battery box, screws and cables",
        covers="Line follower, obstacle avoider, Bluetooth car: the first rolling robot.",
        uno_price=68000,
    ),
    "picode": dict(
        name="PiCode Lab", tag="Raspberry Pi Pico RP2040", price=40500, list=48000,
        img="c-004", stage="SS1-SS2", chapters="6",
        has="RP2040 board (dual core, MicroPython and C++), LCD 1602, DHT11, IR receiver, buttons, buzzer, LEDs, resistors, potentiometer, breadboards",
        covers="Python on hardware with the Thonny IDE. Extends the MicroPython material in Chapter 6.",
    ),
    "rover_sense": dict(
        name="Rover Sense IoT", tag="WiFi sensing robot", price=95000, list=112000,
        img="c-005", stage="SS2-SS3", chapters="9, 13",
        has="2WD robot car, 22 sensors, ESP32 WiFi board, Arduino UNO, Blynk phone dashboard",
        covers="An environmental monitoring robot that streams temperature, soil and distance readings.",
    ),
    "rover_guard": dict(
        name="Rover Guard IoT", tag="RFID security robot", price=117000, list=138000,
        img="c-006", stage="SS2-SS3", chapters="9, 13",
        has="2WD robot car, RFID kit, ESP32 WiFi, RFID RC522 with cards, keypad, servo gate, LCD",
        covers="RFID patrol robot and attendance bot, unlocked from a phone over WiFi.",
    ),
    "ultimate": dict(
        name="Rover Ultimate-X", tag="The everything kit", price=158999, list=195000,
        img="c-007", stage="SS2-SS3 and staff", chapters="9, 13, 15",
        has="2WD car, 22 sensors, full RFID kit, ESP32 and ESP32-CAM, 2 Arduino UNO, breadboards, OLED",
        covers="FPV camera robot, RFID gate, sensor dashboard and AI detection. One kit for a whole semester lab.",
    ),
}

DISCOUNT_5 = 0.05    # "Buy 5+ kits - 5% off"
DISCOUNT_10 = 0.10   # "Buy 10+ - 10% off"


def discount_rate(qty: int) -> float:
    if qty >= 10:
        return DISCOUNT_10
    if qty >= 5:
        return DISCOUNT_5
    return 0.0


def pack_total(lines):
    """lines: [(unit_price, qty), ...]. Discount follows the pack's total kit count."""
    qty = sum(q for _, q in lines)
    gross = sum(p * q for p, q in lines)
    rate = discount_rate(qty)
    net = round(gross * (1 - rate))
    return dict(qty=qty, gross=gross, rate=rate, net=net, saving=gross - net)


PACKS = [
    dict(
        key="foundations", title="Foundations Lab", stage="JSS1-JSS2",
        blurb="Ten groups of three learn circuits, sensors and block-to-text coding on the same board.",
        lines=[("Ignite Genesis", KITS["ignite"]["price"], 10)],
        chapters="Chapters 4 to 6",
    ),
    dict(
        key="builders", title="Builders Lab", stage="JSS3-SS1",
        blurb="Ten groups each build, wire and drive their own rolling robot, then run the line-follower and obstacle-avoider.",
        lines=[("Rover M2 with UNO", KITS["rover_m2"]["uno_price"], 10)],
        chapters="Chapters 12 and 13",
    ),
    dict(
        key="systems", title="Systems and AI Lab", stage="SS2-SS3",
        blurb="Five senior teams build connected robots with WiFi, RFID and an on-board camera for vision work.",
        lines=[("Rover Ultimate-X", KITS["ultimate"]["price"], 5)],
        chapters="Chapters 9, 13 and 15",
    ),
    dict(
        key="staff", title="Staff Training Kits", stage="Teachers",
        blurb="One Ultimate-X for every two teachers on the Academy, so every pair builds each project in the book.",
        lines=[("Rover Ultimate-X", KITS["ultimate"]["price"], 3)],
        chapters="All build chapters",
        note="Sized for six teachers",
    ),
]
for _p in PACKS:
    _p["calc"] = pack_total([(price, qty) for _, price, qty in _p["lines"]])

# --------------------------------------------------------------------- book --
BOOK = dict(
    title="Robotics for Everyone",
    subtitle="A Practical Guide for Beginners",
    author="Okanlawon Olayemi",
    pages=331,
    chapters=20,
    projects=18,
)

# (chapter number, title exactly as printed in the book's contents)
CHAPTERS = [
    (1, "What Is a Robot?"),
    (2, "The Building Blocks of a Robot"),
    (3, "Thinking Like a Robotics Engineer"),
    (4, "Electronics Essentials"),
    (5, "Your First Microcontroller Boards"),
    (6, "Programming Robots in C, C++ and Python"),
    (7, "Sensing the World"),
    (8, "Distance, Motion and Position Sensors"),
    (9, "Identification, Switching, Displays and Wireless"),
    (10, "Motors, Servos and Actuators"),
    (11, "Introduction to Control Systems"),
    (12, "Practical Motor Control"),
    (13, "Wheeled Robots"),
    (14, "Legged Robots and the Hexapod"),
    (15, "Adding Computer Vision to Your Robot"),
    (16, "ROS 2 Basics"),
    (17, "Physical AI, Language Models and Humanoid Robots"),
    (18, "Simulation and Testing Before You Build"),
    (19, "Safety, Ethics and Real-World Considerations"),
    (20, "Where to Go From Here"),
]

# ------------------------------------------------------------ staff academy --
# Ten sessions, three hours each. `chapters` drives the coverage test: every
# chapter 1-20 must appear in exactly one core session or in OPTIONAL.
SESSIONS = [
    dict(n=1, title="What a robot is, and what it is made of", chapters=[1, 2],
         do="Sort real machines into robot and not-robot. Draw the sense, think, act loop for a school object.",
         leave="A shared definition and a block diagram teachers can reuse in class."),
    dict(n=2, title="Safety first, then the engineering mindset", chapters=[3, 19],
         do="Run the Safety Notes checklist on your own lab. Write a power budget and a test plan.",
         leave="A signed-off lab safety routine. Teachers cannot take student kits until this is passed."),
    dict(n=3, title="Electronics and your first boards", chapters=[4, 5],
         do="Ohm's law on a breadboard with a multimeter. Blink an LED on the Uno and on the ESP32.",
         leave="Confidence to wire, measure and flash a board without help."),
    dict(n=4, title="Programming in C, C++ and Python", chapters=[6],
         do="Write, break and debug sketches. Run the same idea in MicroPython on the ESP32.",
         leave="A debugging routine teachers can model aloud to a class."),
    dict(n=5, title="Sensing the world", chapters=[7],
         do="Sensor projects 1 to 8: temperature, rain, soil, gas, light, touch, sound.",
         leave="Eight working sensor builds and the classroom version of each."),
    dict(n=6, title="Distance, motion, identification and wireless", chapters=[8, 9],
         do="Sensor projects 9 to 18: ultrasonic, PIR, tilt, reed, MPU-6050, RFID, relay, LCD, radio, ESP-NOW.",
         leave="All eighteen projects done once, by the teacher, before any student does them."),
    dict(n=7, title="Motors, feedback and PID", chapters=[10, 11],
         do="Drive DC motors, servos and a stepper. Tune a simple controller and watch it settle.",
         leave="A plain-language way to explain feedback to a JSS3 or SS1 class."),
    dict(n=8, title="Practical motor control", chapters=[12],
         do="Motor driver wiring, speed control, encoders. Make a chassis drive straight.",
         leave="A chassis that drives straight, and the reason it did not at first."),
    dict(n=9, title="Wheeled robots and robot vision", chapters=[13, 15],
         do="Build the line follower and obstacle avoider. Stream video from an ESP32-CAM and track a colour.",
         leave="The two capstone builds students will attempt in Term 2."),
    dict(n=10, title="Simulate, think about AI, plan the term", chapters=[17, 18, 20],
         do="Obstacle avoidance in Webots. Connect a language model to a robot through an allowed-commands list. Draft your Term 1 plan.",
         leave="A teaching plan for the term and the practical assessment."),
]
OPTIONAL = [
    dict(chapter=14, note="Legged Robots and the Hexapod: servo-heavy build for an after-school club lead"),
    dict(chapter=16, note="ROS 2 Basics: for the teacher who will lead the SS2-SS3 AI club"),
]

# ---------------------------------------------------------------- reference --
REFERENCES = [
    ("Nigeria's National Artificial Intelligence Strategy (NAIS), 2025-2029", "Federal Ministry of Communications, Innovation and Digital Economy"),
    ("3 Million Technical Talent (3MTT) programme", "NITDA"),
    ("Nigeria records 99.6% completion rate in 3MTT assessments", "Technology Times"),
    ("The Future of Jobs Report 2025", "World Economic Forum"),
    ("China mandates AI education nationwide", "The AI Track, with SCMP"),
    ("India makes AI curriculum mandatory for primary schools", "Tech Wire Asia"),
    ("AI competency framework for students", "UNESCO"),
    ("AI competency framework for teachers", "UNESCO"),
    ("Four teens to represent Nigeria at the global robotics championship", "Leadership Nigeria"),
    ("Winners from the Robotics for Good Youth Challenge 2025", "AI for Good, ITU"),
]

CONTACT = dict(email="info@okhubtech.com", phone="+234 906 995 8990",
               instagram="@okhubtech", facebook="okhubtech", youtube="@okhubtech",
               address="Mokola, Ibadan, Oyo State")


def naira(n: int) -> str:
    return f"₦{n:,}"
