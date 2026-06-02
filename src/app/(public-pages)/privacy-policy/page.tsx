import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  robots: { index: false }
};

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl space-y-8'>
        <h1 className='text-foreground text-3xl font-bold'>Chính sách bảo mật</h1>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>1. Giới thiệu</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            IQode Lab cam kết bảo vệ thông tin cá nhân của học viên, phụ huynh và giáo viên khi sử
            dụng nền tảng quản lý học tập này. Chính sách bảo mật mô tả cách chúng tôi thu thập, sử
            dụng và bảo vệ dữ liệu của bạn.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>2. Thông tin thu thập</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Chúng tôi thu thập các thông tin cần thiết cho việc quản lý tài khoản và học tập, bao
            gồm: họ tên, địa chỉ email, số điện thoại liên lạc, thông tin học viên (họ tên, độ tuổi)
            và lịch sử điểm danh. Thông tin được thu thập khi bạn đăng ký tài khoản hoặc trong quá
            trình sử dụng dịch vụ.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>3. Mục đích sử dụng</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Thông tin thu thập được sử dụng để: xác thực và quản lý tài khoản người dùng, theo dõi
            tiến độ học tập và điểm danh của học viên, liên lạc với phụ huynh về lịch học và thông
            báo từ trung tâm, cải thiện chất lượng dịch vụ.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>4. Xác thực và bảo mật</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Hệ thống xác thực sử dụng JWT (JSON Web Token) lưu trữ trong cookie HTTP. Mật khẩu được
            mã hóa trước khi lưu trữ. Phiên đăng nhập có thời hạn và tự động gia hạn an toàn. Chúng
            tôi áp dụng các biện pháp kỹ thuật phù hợp để bảo vệ dữ liệu khỏi truy cập trái phép.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>5. Không chia sẻ thông tin</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            IQode Lab không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba vì
            mục đích thương mại. Dữ liệu chỉ được dùng trong phạm vi hoạt động của trung tâm và
            không được khai thác ngoài mục đích đã nêu.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>6. Quyền của người dùng</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình. Để thực hiện
            các yêu cầu này, vui lòng liên hệ với chúng tôi theo thông tin bên dưới.
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>7. Liên hệ</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:{' '}
            <a
              href='mailto:iqode.file@gmail.com'
              className='text-primary font-medium hover:underline'
            >
              iqode.file@gmail.com
            </a>
          </p>
        </section>

        <div className='border-border border-t pt-4'>
          <p className='text-muted-foreground text-sm'>Cập nhật lần cuối: tháng 6 năm 2026</p>
        </div>
      </div>
    </div>
  );
}
