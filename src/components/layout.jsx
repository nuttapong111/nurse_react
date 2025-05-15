import React, { useEffect, useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Drawer } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import "./layout.css";

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

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
      {/* <Menu.Item key="/profile" icon={<UserOutlined />}>
        โปรไฟล์ของฉัน
      </Menu.Item> */}
      <Menu.Item key="logout" danger icon={<LogoutOutlined />}>
        ออกจากระบบ
      </Menu.Item>
    </Menu>
  );

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
              <Menu.Item key="/manage-ward">เพิ่มวอร์ด</Menu.Item>
              <Menu.Item key="/manage-staff">เพิ่มคนในวอร์ด</Menu.Item>
              <Menu.Item key="/manage-rule">ตั้งค่าเวรแต่ละวอร์ด</Menu.Item>
              <Menu.Item key="/manage-request">
                กำหนดวันหยุดของแต่ละคน
              </Menu.Item>
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
          {/* <UserOutlined onClick={() => navigate("/profile")} /> */}
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
            <Menu.Item key="/manage-ward">เพิ่มวอร์ด</Menu.Item>
            <Menu.Item key="/manage-staff">เพิ่มคนในวอร์ด</Menu.Item>
            <Menu.Item key="/manage-rule">ตั้งค่าเวรแต่ละวอร์ด</Menu.Item>
            <Menu.Item key="/manage-request">กำหนดวันหยุดของแต่ละคน</Menu.Item>
          </Menu>
        </Drawer>
      </Layout>
    </>
  );
};

export default AppLayout;
