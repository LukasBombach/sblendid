# Development

## Running Tests

In order to run tests, you need an actual BLE device. We can't simulate that stuff and pretend it works. Luckily for iOS users there is `LightBlue Explorer`

👉 https://apps.apple.com/us/app/lightblue-explorer/id557428110

The tests I wrote are tightly coupled to communicating with a BLE peripheral called "Find me" and runs specific tests on it. LightBlue Explorer can create that peripheral on your iOS device so that you can communicate with that peripheral on the computer you are developing on.

Note that you _`don't need LightBlue Explorer`_ for this. If you have any hardware that can communicate via BLE, you can use software to make it appear as any kind of BLE peripheral. So what LightBlue Explorer does is just create a peripheral on your iPhone, which is hardware that can do BLE, and allows others to find it.

Having said that, _I use LightBlue Explorer_ because I have an iPhone and it was somewhat easy for me to work with it. If you have an Android device or any other device you want to use, please contact me by [opening an issue and maybe we can work it out](https://github.com/LukasBombach/sblendid/issues/new).

Now my test setup is kind of biased towards LightBlue Explorer because this is what you need to to to get my setup working:

1. [Install LightBlue Explorer on your iOS device](https://apps.apple.com/us/app/lightblue-explorer/id557428110)
1. Open the app and click on "Virtual Devices" in the menu bar [Screenshot](./imageslightblue_explorer_virtual_devices_empty.jpeg)
1. Click the plus icon on the top right to add a new device
1. There is a pre-defined device called "Find Me", select that one [Screenshot](./lightblue_explorer_virtual_devices_find_me.jpeg)
1. Click save and you're done

All my tests should work with that device. When you have created that device and the app is running and you phone is not locked all your tests should run.

You can probably use any other app and BLE enabled hardware (like Android or another computer) for that. [Let's talk!](https://github.com/LukasBombach/sblendid/issues/new)

### Caveats

There is a caveat. The "Find Me" virtual device can only be properly find while the app is open and your phone is not locked. So you need to unlock you phone and have the app open while you run your tests or some tests will fail.
