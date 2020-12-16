import java.text.DecimalFormat;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;


public class lockMain {

	public final static String SUBSCRIBE_TOPIC = "home/sensors/id";
	public final static String PUBLISH_TOPIC = "home/sensors/lock_state";
	public static boolean lockState = false;
	public static String deviceID = "";

	public static void main(String[] args) throws MqttException , InterruptedException {
		if (args.length < 2) {
			System.err.println("please provide broker server address; (such as localhost) and a device ID (such as 1 or 2)");
			return;
		}

		final String publisherId = UUID.randomUUID().toString();
		final IMqttClient mqttClient = new MqttClient("tcp://" + args[0] + ":1883", publisherId);
		try {
			deviceID = args[1];
		} catch (Exception e) {
			System.err.println("please provide broker server address; (such as localhost) and a device ID (such as 1 or 2)");
			return;
		}


		final MqttConnectOptions options = new MqttConnectOptions();
		options.setAutomaticReconnect(true);
		options.setCleanSession(true);
		options.setConnectionTimeout(10);
		mqttClient.connect(options);

		// subscribe  
		CountDownLatch receivedSignal = new CountDownLatch(10);
		mqttClient.subscribe(SUBSCRIBE_TOPIC, (topic, msg) -> {
			String payload = new String ( msg.getPayload() );
			if (payload.equalsIgnoreCase(deviceID)) {
				MqttMessage returnMessage = new MqttMessage((deviceID+":"+lockState).getBytes());
				returnMessage.setQos(0);
				returnMessage.setRetained(true);
				System.out.println(returnMessage);
				mqttClient.publish(PUBLISH_TOPIC, returnMessage);
			}
			receivedSignal.countDown();
		});

		// print temperature readings every half second
		while (true) {
			System.out.println(lockState);
			Thread.sleep(1000);
		}
	}
}
