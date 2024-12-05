import helpers.central_hub as hub
import helpers.strongarm as strongarm


TEST_ANGLES_1 = [15, 55, 175, 115, 95, 5]


def setup_module():
    hub.start()
    strongarm.start()


def teardown_module():
    strongarm.stop()
    hub.stop()


class TestStrongarm:
    def test_angles_change(self):
        assert True

        ws = hub.connect()
        hub.send_subscribe(ws, ["current_angles"])
        hub.send(ws, {"type": "getState"})
        initial_state = hub.recv(ws)
        print(f"{initial_state=}")

        # send a set_angles update to the strongarm
        hub.send_state_update(ws, {"set_angles": TEST_ANGLES_1})

        # it should respond within 100ms with a current_angles update
        updated_state = hub.recv(ws)
        print(f"{updated_state=}")
        assert (
            updated_state["data"]["current_angles"]
            != initial_state["data"]["current_angles"]
        )

        ws.close()
