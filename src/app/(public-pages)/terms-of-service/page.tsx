import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ',
  robots: { index: false }
};

export default function TermsOfServicePage() {
  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl space-y-8'>
        <div className='text-center'>
          <h1 className='text-foreground text-3xl font-bold'>Điều khoản dịch vụ</h1>
          <p className='text-muted-foreground mt-2 text-sm'>Cập nhật lần cuối: tháng 6 năm 2026</p>
        </div>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>1. Giới thiệu</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Chào mừng bạn đến với IQode Lab — nền tảng quản lý học tập lập trình cho trẻ em từ 6–17
            tuổi. Bằng cách đăng ký và sử dụng dịch vụ, bạn đồng ý với các điều khoản dưới đây. Vui
            lòng đọc kỹ trước khi tiếp tục.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>2. Tài khoản người dùng</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Mỗi phụ huynh hoặc giáo viên cần tạo một tài khoản cá nhân để sử dụng hệ thống. Bạn có
            trách nhiệm bảo mật thông tin đăng nhập và chịu trách nhiệm với mọi hoạt động phát sinh
            từ tài khoản của mình. Vui lòng thông báo ngay cho chúng tôi nếu phát hiện truy cập trái
            phép.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>3. Đăng ký và thanh toán</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Phụ huynh đăng ký học viên vào lớp học thông qua hệ thống. Học phí và điều kiện thanh
            toán được thông báo cụ thể khi đăng ký từng khóa học. IQode Lab có quyền điều chỉnh học
            phí với thông báo trước tối thiểu 30 ngày.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>4. Lịch học và nghỉ học</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Lịch học được thông báo qua hệ thống và có thể điều chỉnh trong trường hợp đặc biệt. Học
            viên nghỉ học cần thông báo trước ít nhất 24 giờ. IQode Lab có thể sắp xếp buổi học bù
            tùy theo điều kiện lớp học; chính sách hoàn tiền cụ thể được áp dụng theo từng trường
            hợp.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>5. Quyền sở hữu trí tuệ</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Tất cả nội dung giảng dạy, tài liệu học tập và phần mềm trên nền tảng là tài sản trí tuệ
            của IQode Lab. Nghiêm cấm sao chép, phân phối hoặc sử dụng cho mục đích thương mại khi
            chưa có sự đồng ý bằng văn bản.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>6. Giới hạn trách nhiệm</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            IQode Lab nỗ lực duy trì hệ thống hoạt động ổn định nhưng không đảm bảo dịch vụ luôn
            liên tục, không có lỗi. Chúng tôi không chịu trách nhiệm với các thiệt hại gián tiếp
            phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>7. Thay đổi điều khoản</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            IQode Lab có quyền cập nhật điều khoản dịch vụ theo thời gian. Thay đổi quan trọng sẽ
            được thông báo qua email hoặc hệ thống. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi
            có hiệu lực đồng nghĩa với việc bạn chấp nhận điều khoản mới.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>8. Luật áp dụng</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Điều khoản dịch vụ này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp phát sinh
            sẽ được giải quyết tại tòa án có thẩm quyền tại Hà Nội, Việt Nam.
          </p>
        </section>

        <section className='border-border border-t pt-4'>
          <p className='text-muted-foreground text-center text-sm'>
            Câu hỏi về điều khoản dịch vụ, vui lòng liên hệ{' '}
            <a
              href='mailto:iqode.file@gmail.com'
              className='text-primary font-medium hover:underline'
            >
              iqode.file@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
