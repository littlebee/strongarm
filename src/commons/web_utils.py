import json


def json_response(app, data):
    response = app.response_class(
        response=json.dumps(data), status=200, mimetype="application/json"
    )
    return response


def respond_ok(app, data=None):
    return json_response(app, {"status": "ok", "data": data})


def respond_not_ok(app, status, data):
    return json_response(app, {"status": status, "data": data})
