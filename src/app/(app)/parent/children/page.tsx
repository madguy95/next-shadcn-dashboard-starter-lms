import PageContainer from '@/components/layout/page-container';
import {
  MyChildrenHeaderAction,
  MyChildrenView
} from '@/features/parent/components/my-children-view';

export const metadata = {
  title: 'Parent: Con tôi'
};

export default function ParentChildrenPage() {
  return (
    <PageContainer
      pageTitle='Con tôi'
      pageDescription='Quản lý hồ sơ, khóa học, lịch học và phụ huynh đi kèm của các con.'
      pageHeaderAction={<MyChildrenHeaderAction />}
    >
      <MyChildrenView />
    </PageContainer>
  );
}
