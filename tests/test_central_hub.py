import helpers.central_hub as hub

# semi-random values to use for testing
TEST_ANGLES_1 = [10, 50, 180, 120, 90, 0]
TEST_ANGLES_2 = [15, 55, 175, 115, 95, 5]


def setup_module():
    hub.start()


def teardown_module():
    hub.stop()


class TestCentralHub:
    def test_connect_identify(self):
        ws = hub.connect()
        hub.send(ws, {"type": "identity", "data": "test_system"})
        response = hub.recv(ws)
        ws.close()

        assert response["type"] == "iseeu"

    def test_state(self):
        ws = hub.connect()

        hub.send(ws, {"type": "getState"})
        initial_state = hub.recv(ws)
        # print(f"{initial_state=}")

        # angles should be empty initially
        assert initial_state["data"]["set_angles"] != TEST_ANGLES_1

        hub.send_state_update(ws, {"set_angles": TEST_ANGLES_1})
        hub.send(ws, {"type": "getState"})
        updated_state = hub.recv(ws)
        # print(f"{updated_state=}")
        assert updated_state["data"]["set_angles"] == TEST_ANGLES_1
        ws.close()

    def test_pubsub(self):
        ws1 = hub.connect()
        hub.send_subscribe(ws1, ["set_angles", "current_angles"])
        # should not have received anything in response to subscribe
        assert not hub.has_received_data(ws1)

        ws2 = hub.connect()
        hub.send_subscribe(ws2, ["current_angles"])

        # second client sends a set_angles update
        hub.send_state_update(ws2, {"set_angles": TEST_ANGLES_1})

        # the second client should not receive a set_angles update
        # because it is not subscribed to "current_angles"
        assert not hub.has_received_data(ws2)
        # first client has subscribed to set_angles updates and should recv a message
        assert hub.has_received_state_update(ws1, "set_angles", TEST_ANGLES_1)

        # second client sends a current_angles update which both clients are subscribed
        hub.send_state_update(ws2, {"current_angles": TEST_ANGLES_1})
        # first client has subscribed to current_angles updates and should recv a message
        assert hub.has_received_state_update(ws1, "current_angles", TEST_ANGLES_1)
        # second client has also subscribed to current_angles updates and should recv a message
        assert hub.has_received_state_update(ws2, "current_angles", TEST_ANGLES_1)

        # first client sends a current_angles update which both clients are subscribed
        hub.send_state_update(ws1, {"current_angles": TEST_ANGLES_2})
        # first client has subscribed to current_angles updates and should recv a message
        assert hub.has_received_state_update(ws1, "current_angles", TEST_ANGLES_2)
        # second client has also subscribed to current_angles updates and should recv a message
        assert hub.has_received_state_update(ws2, "current_angles", TEST_ANGLES_2)

        # first client sends a feeder update which neither clients are subscribed
        hub.send_state_update(ws1, {"feeder": TEST_ANGLES_1})
        assert not hub.has_received_data(ws1)
        assert not hub.has_received_data(ws1)

        # after all of the above, our state should reflect all changes
        hub.send(ws1, {"type": "getState"})
        updated_state = hub.recv(ws1)
        assert updated_state["data"]["set_angles"] == TEST_ANGLES_1
        assert updated_state["data"]["current_angles"] == TEST_ANGLES_2

        ws1.close()
        ws2.close()
