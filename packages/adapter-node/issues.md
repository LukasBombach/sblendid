    startScanning

> Error: No introspectable

    bluetoothd -n

> bluetoothd: Bluetooth daemon 5.48
> D-Bus setup failed: Connection ":x.xx" is not allowed to own the service "org.bluez" due to security policies in the configuration file
> bluetoothd: Unable to get on D-Bus

sudo nano /etc/dbus-1/system.d/bluetooth.conf
