import { mysqlTable, varchar, int, timestamp, text, boolean, decimal, time, serial, primaryKey } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Better Auth Tables
export const user = mysqlTable("user", {
					id: varchar("id", { length: 36 }).primaryKey(),
					name: text("name").notNull(),
					email: varchar("email", { length: 255 }).notNull().unique(),
					emailVerified: boolean("emailVerified").notNull(),
					image: text("image"),
					createdAt: timestamp("createdAt").notNull(),
					updatedAt: timestamp("updatedAt").notNull(),
          role: varchar("role", { length: 32 }).default("customer")
				});

export const session = mysqlTable("session", {
					id: varchar("id", { length: 36 }).primaryKey(),
					expiresAt: timestamp("expiresAt").notNull(),
					token: varchar("token", { length: 255 }).notNull().unique(),
					createdAt: timestamp("createdAt").notNull(),
					updatedAt: timestamp("updatedAt").notNull(),
					ipAddress: text("ipAddress"),
					userAgent: text("userAgent"),
					userId: varchar("userId", { length: 36 }).notNull().references(() => user.id)
				});

export const account = mysqlTable("account", {
					id: varchar("id", { length: 36 }).primaryKey(),
					accountId: text("accountId").notNull(),
					providerId: text("providerId").notNull(),
					userId: varchar("userId", { length: 36 }).notNull().references(() => user.id),
					accessToken: text("accessToken"),
					refreshToken: text("refreshToken"),
					idToken: text("idToken"),
					accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
					refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
					scope: text("scope"),
					password: text("password"),
					createdAt: timestamp("createdAt").notNull(),
					updatedAt: timestamp("updatedAt").notNull()
				});

export const verification = mysqlTable("verification", {
					id: varchar("id", { length: 36 }).primaryKey(),
					identifier: text("identifier").notNull(),
					value: text("value").notNull(),
					expiresAt: timestamp("expiresAt").notNull(),
					createdAt: timestamp("createdAt"),
					updatedAt: timestamp("updatedAt")
				});

// App Tables

export const transportations = mysqlTable("transportations", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(), // e.g. K.17, AO5
    type: varchar("type", { length: 50 }).notNull(), // Angkot, Bus, KRL, Shuttle
    capacity: int("capacity"),
    facilities: text("facilities"), // e.g. "AC, WiFi"
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});

export const stops = mysqlTable("stops", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // Halte, Terminal, Stasiun
    latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
    longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});

export const routes = mysqlTable("routes", {
    id: int("id").autoincrement().primaryKey(),
    transportationId: int("transportation_id").references(() => transportations.id, { onDelete: 'cascade' }),
    name: varchar("name", { length: 150 }).notNull(), // e.g. Cikarang - Cibarusah
    originStopId: int("origin_stop_id").references(() => stops.id, { onDelete: 'set null' }),
    destinationStopId: int("destination_stop_id").references(() => stops.id, { onDelete: 'set null' }),
    polylineData: text("polyline_data"), // JSON string or geojson for map lines
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});

export const routeStops = mysqlTable("route_stops", {
    id: int("id").autoincrement().primaryKey(),
    routeId: int("route_id").references(() => routes.id, { onDelete: 'cascade' }),
    stopId: int("stop_id").references(() => stops.id, { onDelete: 'cascade' }),
    stopOrder: int("stop_order").notNull()
});

export const schedules = mysqlTable("schedules", {
    id: int("id").autoincrement().primaryKey(),
    routeId: int("route_id").references(() => routes.id, { onDelete: 'cascade' }),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    headwayMinutes: int("headway_minutes").notNull(), // e.g. every 15 mins
    operationalDays: varchar("operational_days", { length: 100 }).default("Everyday"), // e.g. Weekdays, Everyday
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});

export const fares = mysqlTable("fares", {
    id: int("id").autoincrement().primaryKey(),
    transportationId: int("transportation_id").references(() => transportations.id, { onDelete: 'cascade' }),
    routeId: int("route_id").references(() => routes.id, { onDelete: 'cascade' }), // nullable if global for transportation
    baseFare: decimal("base_fare", { precision: 10, scale: 2 }).notNull(),
    farePerKm: decimal("fare_per_km", { precision: 10, scale: 2 }).default("0.00"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});

// Relations
export const transportationsRelations = relations(transportations, ({ many }) => ({
    routes: many(routes),
    fares: many(fares)
}));

export const stopsRelations = relations(stops, ({ many }) => ({
    routeStops: many(routeStops)
}));

export const routesRelations = relations(routes, ({ one, many }) => ({
    transportation: one(transportations, {
        fields: [routes.transportationId],
        references: [transportations.id]
    }),
    originStop: one(stops, {
        fields: [routes.originStopId],
        references: [stops.id]
    }),
    destinationStop: one(stops, {
        fields: [routes.destinationStopId],
        references: [stops.id]
    }),
    routeStops: many(routeStops),
    schedules: many(schedules),
    fares: many(fares)
}));

export const routeStopsRelations = relations(routeStops, ({ one }) => ({
    route: one(routes, {
        fields: [routeStops.routeId],
        references: [routes.id]
    }),
    stop: one(stops, {
        fields: [routeStops.stopId],
        references: [stops.id]
    })
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
    route: one(routes, {
        fields: [schedules.routeId],
        references: [routes.id]
    })
}));

export const faresRelations = relations(fares, ({ one }) => ({
    transportation: one(transportations, {
        fields: [fares.transportationId],
        references: [transportations.id]
    }),
    route: one(routes, {
        fields: [fares.routeId],
        references: [routes.id]
    })
}));
