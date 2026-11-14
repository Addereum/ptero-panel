import md5 from '@/lib/md5';

describe('@/lib/md5.ts', () => {
    it('should hash standard ascii strings correctly', () => {
        expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
        expect(md5('test')).toBe('098f6bcd4621d373cade4e832627b4f6');
        expect(md5('lukas@example.com')).toBe('ca7805939105b0f45998f9e159809ad8');
        expect(md5('admin@example.com')).toBe('e64c7d89f26bd1972efa854d13d7dd61');
    });

    it('should hash UTF-8 characters correctly', () => {
        expect(md5('münchen@test.de')).toBe('12a8ff310b96d15c5edb1a71ba6dd568');
    });
});
