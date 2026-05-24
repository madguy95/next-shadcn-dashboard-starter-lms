import PageContainer from '@/components/layout/page-container';
import {
  EnrollmentHeaderAction,
  EnrollmentView
} from '@/features/parent/components/enrollment-view';

export const metadata = {
  title: 'Parent: Đăng ký khóa học'
};

export default function ParentEnrollmentPage() {
  return (
    <PageContainer
      pageTitle='Đăng ký khóa học cho con'
      pageDescription='Tìm và đăng ký khóa phù hợp với con. Trung tâm xác nhận lớp trong vòng 24 giờ.'
      pageHeaderAction={<EnrollmentHeaderAction />}
    >
      <EnrollmentView />
    </PageContainer>
  );
}
