import helpers.central_hub as hub
import helpers.start_stop as sss


def setup_module():
    sss.start_services(["central_hub", "arm_configs_provider"])


def teardown_module():
    sss.stop_services(["arm_configs_provider", "central_hub"])


class TestArmConfigsProvider:
    def test_arm_config_selected(self):
        ws = hub.connect("test_client_1")
        hub.send_subscribe(ws, ["arm_config_selected", "arm_config"])
        initial_state = self.assert_get_state("test_arm_config_selected", ws)
        initial_arm_selected = initial_state["data"]["arm_config_selected"]
        different_arm_config_file = next(
            obj
            for obj in initial_state["data"]["arm_config_files"]
            if obj != initial_arm_selected
        )
        updated_state = self.assert_change_arm_config(ws, different_arm_config_file)
        arm_parts = updated_state["data"]["arm_config"]["arm_parts"]
        assert arm_parts != initial_state["data"]["arm_config"]["arm_parts"]
        assert arm_parts[0]["part_json_file"]
        assert arm_parts[0]["name"]

        # don't forget to change the selected arm config back to the initial one
        # because it is persisted in the hub_state and will effect other tests
        self.assert_change_arm_config(ws, initial_arm_selected)

        ws.close()

    def test_bogus_arm_config_selected(self):
        ws = hub.connect("test_client_1")
        hub.send_subscribe(ws, ["arm_config_selected", "arm_config"])
        initial_state = self.assert_get_state("test_arm_config_selected", ws)
        initial_arm_selected = initial_state["data"]["arm_config_selected"]
        different_arm_config_file = "some_non_existent_arm_config_file.json"

        # we should receive an update with the new arm_config_selected we sent
        hub.send_state_update(ws, {"arm_config_selected": different_arm_config_file})
        updated_state = hub.recv(ws)
        assert updated_state["data"]["arm_config_selected"] == different_arm_config_file

        # then we should receive an update with the new original arm_config_selected
        updated_state = hub.recv(ws)
        assert updated_state["data"]["arm_config_selected"] == initial_arm_selected

    @staticmethod
    def assert_get_state(test_name, ws):
        hub.send(ws, {"type": "getState"})

        initial_state = hub.recv(ws)
        # print(f"{test_name}: initial_state={json.dumps(initial_state, indent=2)}")
        print(f"{test_name}: initial_state={initial_state}")

        assert initial_state["data"]["arm_config"]
        assert len(initial_state["data"]["arm_config"]["arm_parts"]) > 1
        assert len(initial_state["data"]["arm_config_files"]) > 1
        assert len(initial_state["data"]["arm_config_selected"]) > 1

        return initial_state

    @staticmethod
    def assert_change_arm_config(ws, new_arm_config_file):
        hub.send_state_update(ws, {"arm_config_selected": new_arm_config_file})
        # we should receive an update with the new arm_config_selected we sent
        updated_state = hub.recv(ws)
        assert updated_state["data"]["arm_config_selected"] == new_arm_config_file

        # we should then receive an update with the new arm_config sent by the provider
        updated_state = hub.recv(ws)
        assert updated_state["data"]["arm_config"]["filename"] == new_arm_config_file

        return updated_state
