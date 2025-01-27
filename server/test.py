import serial
import time

def lock_door(arduino):
    command = 'l'  # Command for locking the door
    arduino.write(command.encode())
    print(f"Sent command to lock door: {command}")


def unlock_door(arduino):
    command = 'u'  # Command for unlocking the door
    arduino.write(command.encode())
    print(f"Sent command to unlock door: {command}")

def main():
    arduino_port = 'COM3'
    baud_rate = 9600

    try:
        arduino = serial.Serial(arduino_port, baud_rate, timeout=1)
        print(f"Connected to Arduino on {arduino_port}")

        print("waiting for the connection to initialize")
        time.sleep(2) 

        i=0
        while i<3:
            val = input("Enter your value: ")
            if val == 'u':
                unlock_door(arduino)
            else:
                lock_door(arduino)
            i += 1
        

        while True:
            if arduino.in_waiting > 0:
                response = arduino.readline().decode().strip()
                print(f"Arduino response: {response}")

            time.sleep(0.1)

    except serial.SerialException as e:
        print(f"Error: {e}")

    except KeyboardInterrupt:
        print("Exiting...")

    finally:
        if 'arduino' in locals() and arduino.is_open:
            arduino.close()
            print("Serial connection closed.")

if __name__ == "__main__":
    main()
