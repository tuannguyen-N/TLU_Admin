import { ApplicationTypeList } from './components/ApplicationTypeList';
import { ApplicationProcessingList } from './components/ApplicationProcessingList';
import classes from './RequestsPage.module.css';

export function RequestsPage() {
  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Đơn từ</h1>
        <p className={classes.pageDesc}>
          Quản lý loại đơn từ và xử lý đơn từ từ sinh viên.
        </p>
      </div>

      <div className={classes.layout}>
        <ApplicationTypeList />
        <ApplicationProcessingList />
      </div>
    </div>
  );
}