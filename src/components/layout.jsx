import React, { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Avatar, Drawer, Modal, Button } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import "./layout.css";

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [packageName, setPackageName] = useState("");

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      localStorage.removeItem("token");
      navigate("/login");
      window.location.reload();
    } else {
      navigate(key);
    }
    setDrawerVisible(false);
  };

  const userMenu = (
    <Menu onClick={handleMenuClick}>
      {/* <Menu.Item key="/profile" icon={<UserOutlined />}> */}
      {/*   โปรไฟล์ของฉัน */}
      {/* </Menu.Item> */}
      <Menu.Item key="logout" danger icon={<LogoutOutlined />}>
        ออกจากระบบ
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/payment/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.expiryDate) {
          setExpiryDate(new Date(data.expiryDate));
          setPackageName(data.package?.name || "");
          const now = new Date();
          const daysLeft = Math.ceil((new Date(data.expiryDate) - now) / (1000 * 60 * 60 * 24));
          const hideKey = `hideExpiryPopup-${now.toISOString().slice(0, 10)}`;
          if (daysLeft <= 30 && !localStorage.getItem(hideKey)) {
            setShowExpiryModal(true);
          }
        }
      } catch (err) {}
    };
    fetchUser();
  }, []);

  const handleCloseExpiryModal = () => {
    const now = new Date();
    const hideKey = `hideExpiryPopup-${now.toISOString().slice(0, 10)}`;
    localStorage.setItem(hideKey, "1");
    setShowExpiryModal(false);
  };

  const daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <>
      {/* Desktop Layout */}
      <Layout className="d-none d-md-flex" style={{ minHeight: "100vh" }}>
        <Sider theme="light" width={300}>
          <div className="text-center p-3 ">
            <img
              src="/nurse.png"
              alt="logo"
              style={{ width: 150, borderRadius: "50%" }}
            />
            <h5 className="mt-2">ระบบพยาบาล</h5>
            {expiryDate && (
              <div style={{ marginTop: 8, color: daysLeft <= 30 ? '#d4380d' : (daysLeft <= 7 ? '#d4380d' : '#333'), fontWeight: 500 }}>
                อายุการใช้งานคงเหลือ: {daysLeft} วัน<br />
                <span style={{ fontSize: 13, color: '#888' }}>
                  (หมดอายุ {expiryDate.toLocaleDateString('th-TH')})
                </span>
              </div>
            )}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
          >
            <Menu.Item key="/schedule" icon={<CalendarOutlined />}>
              ตารางเวร
            </Menu.Item>
            <SubMenu
              key="manage"
              icon={<SettingOutlined />}
              title="จัดการตารางเวร"
            >
              <Menu.Item key="/manage-schedule">กำหนดเวรประจำวัน</Menu.Item>
              <Menu.Item key="/manage-shift-config">ตั้งค่าเวร (ใหม่)</Menu.Item>
              <Menu.Item key="/manage-ward">เพิ่มวอร์ด</Menu.Item>
              <Menu.Item key="/manage-staff">เพิ่มคนในวอร์ด</Menu.Item>
              <Menu.Item key="/manage-rule">ตั้งค่าเวรแต่ละวอร์ด</Menu.Item>
              <Menu.Item key="/manage-request">กำหนดวันหยุดของแต่ละคน</Menu.Item>
            </SubMenu>
            <SubMenu
              key="package"
              icon={<ShoppingOutlined />}
              title="จัดการแพ็คเกจ"
            >
              <Menu.Item key="/package-list">แพ็คเกจทั้งหมด</Menu.Item>
              <Menu.Item key="/payment-history">ประวัติการชำระเงิน</Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>

        <Layout>
          <Header
            className="d-flex justify-content-end align-items-center bg-white shadow-sm px-4"
            style={{ height: 64 }}
          >
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <Avatar
                size="large"
                icon={<UserOutlined />}
                className="cursor-pointer"
              />
            </Dropdown>
          </Header>
          <Content className="bg-light">
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      {/* Mobile Layout */}
      <Layout className="d-md-none" style={{ minHeight: "100vh" }}>
        <Header className="d-flex justify-content-between align-items-center bg-white shadow-sm px-3">
          {/* <MenuOutlined
            onClick={() => setDrawerVisible(true)}
            style={{ fontSize: 22 }}
          /> */}
          <h5 className="m-0">ระบบพยาบาล</h5>
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <Avatar size="large" icon={<UserOutlined />} />
          </Dropdown>
        </Header>

        <Content className="bg-light" style={{ paddingBottom: 64 }}>
          <Outlet />
        </Content>

        {/* Bottom Navigation */}
        <div className="mobile-nav d-flex justify-content-around bg-white shadow-sm p-2">
          <CalendarOutlined onClick={() => navigate("/schedule")} />
          <SettingOutlined onClick={() => setDrawerVisible(true)} />
          <UserOutlined onClick={() => setDrawerVisible(true)} />
        </div>

        {/* Drawer for Manage Menu */}
        <Drawer
          title="จัดการตารางเวร"
          placement="bottom"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          <Menu onClick={handleMenuClick} mode="vertical">
            <Menu.Item key="/manage-schedule">กำหนดเวรประจำวัน</Menu.Item>
            <Menu.Item key="/manage-shift-config">ตั้งค่าเวร (ใหม่)</Menu.Item>
            <Menu.Item key="/manage-ward">เพิ่มวอร์ด</Menu.Item>
            <Menu.Item key="/manage-staff">เพิ่มคนในวอร์ด</Menu.Item>
            <Menu.Item key="/manage-rule">ตั้งค่าเวรแต่ละวอร์ด</Menu.Item>
            <Menu.Item key="/manage-request">กำหนดวันหยุดของแต่ละคน</Menu.Item>
          </Menu>
        </Drawer>
        <Drawer
          title="จัดการแพ็คเกจ"
          placement="bottom"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          <Menu onClick={handleMenuClick} mode="vertical">
          <Menu.Item key="/package-list">แพ็คเกจทั้งหมด</Menu.Item>
          <Menu.Item key="/payment-history">ประวัติการชำระเงิน</Menu.Item>
          </Menu>
        </Drawer>
      </Layout>

      <Modal
        open={showExpiryModal}
        onCancel={handleCloseExpiryModal}
        footer={[
          <Button key="package" type="primary" onClick={() => {
            const now = new Date();
            const hideKey = `hideExpiryPopup-${now.toISOString().slice(0, 10)}`;
            localStorage.setItem(hideKey, "1");
            setShowExpiryModal(false);
            window.location.href = '/package-list';
          }}>
            ดูแพ็คเกจ/ต่ออายุ
          </Button>,
          <Button key="close" onClick={handleCloseExpiryModal}>
            ปิด
          </Button>
        ]}
        closable={false}
      >
        <h2 style={{ color: "#d4380d" }}>แจ้งเตือนวันหมดอายุการใช้งาน</h2>
        <p>
          {packageName && <>แพ็คเกจ <b>{packageName}</b> ของคุณ</>}
          จะหมดอายุในวันที่ <b>{expiryDate && expiryDate.toLocaleDateString("th-TH")}</b>
        </p>
        <p>กรุณาต่ออายุแพ็คเกจเพื่อใช้งานระบบอย่างต่อเนื่อง</p>
      </Modal>
    </>
  );
};

export default AppLayout;
