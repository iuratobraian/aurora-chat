import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const todayStart = new Date().setHours(0, 0, 0, 0);

    const [allProfiles, allPosts, allMessages] = await Promise.all([
      ctx.db.query("profiles").collect(),
      ctx.db.query("posts").collect(),
      ctx.db.query("chat").collect(),
    ]);

    const totalUsers = allProfiles.length;
    const totalPosts = allPosts.length;
    const totalMessages = allMessages.length;

    const usersToday = allProfiles.filter(p => {
      const registro = new Date(p.fechaRegistro).getTime();
      return registro >= todayStart;
    }).length;

    const usersThisWeek = allProfiles.filter(p => {
      const registro = new Date(p.fechaRegistro).getTime();
      return registro >= oneWeekAgo;
    }).length;

    const activeUsers = allProfiles.filter(p => {
      if (!p.ultimoLogin) return false;
      const lastLogin = new Date(p.ultimoLogin).getTime();
      return lastLogin >= oneDayAgo;
    }).length;

    const postsLast7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const count = allPosts.filter(p => {
        return p.createdAt >= dayStart.getTime() && p.createdAt < dayEnd.getTime();
      }).length;
      
      postsLast7Days.push({
        date: dayStart.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' }),
        count,
      });
    }

    return {
      totalUsers,
      totalPosts,
      totalMessages,
      usersToday,
      usersThisWeek,
      activeUsers,
      postsLast7Days,
    };
  },
});
