import { ApplicationTypeList } from './components/ApplicationTypeList';
import { ApplicationProcessingList } from './components/ApplicationProcessingList';
import classes from './RequestsPage.module.css';
import { useState } from 'react';

export function RequestsPage() {
  const [tab, setTab] = useState("process");

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Đơn từ</h1>
        <p className={classes.pageDesc}>
          Quản lý loại đơn từ và xử lý đơn từ từ sinh viên.
        </p>
      </div>

      <div className={classes.tabs}>
        <button
          className={`${classes.tab} ${tab === "process" ? classes.active : ""}`}
          onClick={() => setTab("process")}
        >
          Xử lý đơn
        </button>
        <button
          className={`${classes.tab} ${tab === "type" ? classes.active : ""}`}
          onClick={() => setTab("type")}
        >
          Loại đơn
        </button>
      </div>

      {/* Content */}
      <div className={classes.content}>
        {tab === "type" && <ApplicationTypeList />}
        {tab === "process" && <ApplicationProcessingList />}
      </div>
    </div>
  );
}