def add_degrees(heading, deg):
    return (heading + deg) % 360


def diff_degrees(deg1, deg2):
    deg1_adj = deg1 + 180 if deg1 < 180 else deg1 - 180
    deg2_adj = deg2 + 180 if deg2 < 180 else deg2 - 180

    return deg1_adj + deg2_adj
