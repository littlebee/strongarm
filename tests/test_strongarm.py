import helpers.central_hub as hub
import helpers.start_stop as sss


TEST_ANGLES_1 = [15, 55, 175, 115, 95, 5]


def setup_module():
    sss.start_services(["central_hub", "arm_configs_provider", "strongarm"])


def teardown_module():
    sss.stop_services(["strongarm", "arm_configs_provider", "central_hub"])


class TestStrongarm:
    def test_angles_change(self):
        ws = hub.connect("test_client_1")
        hub.send_subscribe(ws, ["current_angles"])
        hub.send(ws, {"type": "getState"})
        initial_state = hub.recv(ws)
        print(f"{initial_state=}")

        # send a set_angles update to the strongarm
        hub.send_state_update(ws, {"set_angles": TEST_ANGLES_1})

        # it should respond within 100ms with a current_angles update
        print("waiting for current_angles update")
        updated_state = hub.recv(ws)
        print(f"Received updated state: {updated_state=}")
        assert (
            updated_state["data"]["current_angles"]
            != initial_state["data"]["current_angles"]
        )

        ws.close()

    def test_clamped_angles_change(self):
        test_angles = [-40, 55, 400, 115, 95, 5]
        # these are based on current_arm_config being 4dof-iphone.json
        # and its respective part files. 240 is the max for the 3rd movable part
        expected_clamped_angles = [0, 55, 240, 115, 95, 5]
        ws = hub.connect()
        hub.send_subscribe(ws, ["set_angles", "current_angles"])
        hub.send(ws, {"type": "getState"})
        initial_state = hub.recv(ws)
        print(f"{initial_state=}")

        # send a set_angles update to the strongarm
        hub.send_state_update(ws, {"set_angles": test_angles})

        print("waiting for set_angles updates")
        # it should respond within 100ms first with the set_angles we sent above..
        updated_state = hub.recv(ws)
        print(f"{updated_state=}")
        assert updated_state["data"]["set_angles"] == test_angles
        # ... and then it should send the clamped angles from stromgarm
        updated_state = hub.recv(ws)
        print(f"{updated_state=}")
        assert updated_state["data"]["set_angles"] == expected_clamped_angles

        # it should respond within 100ms with a current_angles update
        print("waiting for current_angles update")
        updated_state = hub.recv(ws)
        updated_current_angles = updated_state["data"]["current_angles"]
        print(f"Received updated state: {updated_state=}")
        assert updated_current_angles and len(updated_current_angles) == 6

        ws.close()
