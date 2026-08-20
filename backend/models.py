from sqlalchemy import Column, Integer, String, Float, DateTime, Date
from database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    site_id = Column(String)
    create_date = Column(DateTime)

    problem_detail_group = Column(String)
    resolution = Column(String)
    resolution_category = Column(String)
    ticket_status = Column(String)

    date = Column(Date)


class KPI(Base):
    __tablename__ = "kpis"

    id = Column(Integer, primary_key=True, index=True)

    kpi_datetime = Column(DateTime)
    site = Column(String)
    eutrancell_name = Column(String)
    usid = Column(String)

    bh_hpcce_util = Column(Float)
    dl_tp_kbps = Column(Float)
    dl_volume_gbyte = Column(Float)

    data_acc_fail_pct = Column(Float)
    data_dcr_num = Column(Float)
    data_dcr_pct = Column(Float)

    volte_acc_fail_pct = Column(Float)
    volte_dcr_pct_worre = Column(Float)
    volte_drop_num_worre = Column(Float)

    ul_rssi_db = Column(Float)
    duac_num = Column(Float)

    interf_ho_sr_pct = Column(Float)
    intraf_ho_sr_pct = Column(Float)

    rrcconn_max = Column(Float)